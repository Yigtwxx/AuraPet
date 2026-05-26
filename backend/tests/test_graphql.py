"""GraphQL mutation tests using mocked MongoDB and AI service."""
from __future__ import annotations

import pytest
from graphql import GraphQLError
from unittest.mock import patch, MagicMock

from app.graphql.mutations import Mutation, _calculate_xp_gain, _calculate_level
from app.services.ai import SentimentResult


def _make_sentiment(score: float) -> SentimentResult:
    from app.services.ai import _score_to_mood
    mood, color = _score_to_mood(score)
    return SentimentResult(score=round(score, 4), mood=mood, color_theme=color)


@pytest.fixture
def mutation():
    return Mutation()


# ── create_user ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_user(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        user = await mutation.create_user(username="testuser", email="t@test.com")

    assert user.username == "testuser"
    assert user.email == "t@test.com"
    assert user.id is not None


@pytest.mark.asyncio
async def test_create_user_duplicate_username(mutation, mock_mongo_db):
    await mock_mongo_db["users"].insert_one({"username": "taken", "email": "a@a.com"})
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.create_user(username="taken", email="b@b.com")
    assert exc_info.value.extensions["code"] == "USERNAME_TAKEN"


@pytest.mark.asyncio
async def test_create_user_duplicate_email(mutation, mock_mongo_db):
    await mock_mongo_db["users"].insert_one({"username": "other", "email": "dup@dup.com"})
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.create_user(username="newuser", email="dup@dup.com")
    assert exc_info.value.extensions["code"] == "EMAIL_TAKEN"


# ── create_pet ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_create_pet(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pet = await mutation.create_pet(user_id="507f1f77bcf86cd799439011", name="Mochi")

    assert pet.name == "Mochi"
    assert pet.level == 1
    assert pet.xp == 0
    assert pet.current_mood == "NEUTRAL"


# ── add_log_entry — happy path (pet exists) ───────────────────────────────

@pytest.mark.asyncio
async def test_add_log_entry_updates_pet_mood(mutation, mock_mongo_db):
    # Pre-insert a pet
    from bson import ObjectId
    user_id = "507f1f77bcf86cd799439011"
    pet_col = mock_mongo_db["pets"]
    await pet_col.insert_one({
        "user_id": user_id,
        "name": "Aura",
        "level": 1,
        "xp": 0,
        "current_mood": "NEUTRAL",
        "color_theme": "#95A5A6",
    })

    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(0.9)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        pet = await mutation.add_log_entry(user_id=user_id, entry_text="Bugün harika!")

    assert pet.current_mood == "HAPPY"
    assert pet.xp == _calculate_xp_gain(0.9)
    assert pet.level == _calculate_level(_calculate_xp_gain(0.9))


# ── add_log_entry — auto-creates pet when none exists ─────────────────────

@pytest.mark.asyncio
async def test_add_log_entry_auto_creates_pet(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439012"
    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(-0.9)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        pet = await mutation.add_log_entry(user_id=user_id, entry_text="Çok kötüyüm.")

    assert pet.name == "Aura"
    assert pet.current_mood == "ANXIOUS"


# ── add_log_entry — model not loaded ──────────────────────────────────────

@pytest.mark.asyncio
async def test_add_log_entry_raises_when_model_not_loaded(mutation, mock_mongo_db):
    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = False

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        from graphql import GraphQLError as GQLError
        with pytest.raises(GQLError, match="AI modeli"):
            await mutation.add_log_entry(user_id="any", entry_text="test")


# ── XP accumulation across multiple entries ───────────────────────────────

@pytest.mark.asyncio
async def test_xp_accumulates_across_entries(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439013"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id,
        "name": "Buddy",
        "level": 1,
        "xp": 90,
        "current_mood": "NEUTRAL",
        "color_theme": "#95A5A6",
    })

    # Score 0.0 → 10 XP gain; 90 + 10 = 100 → level 2
    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(0.0)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        pet = await mutation.add_log_entry(user_id=user_id, entry_text="Sıradan bir gün.")

    assert pet.xp == 100
    assert pet.level == 2
