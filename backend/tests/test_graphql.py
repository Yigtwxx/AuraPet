"""GraphQL mutation + query tests using mocked MongoDB and AI service."""
from __future__ import annotations

from unittest.mock import MagicMock, patch

import pytest
from graphql import GraphQLError

from app.graphql.mutations import Mutation, _calculate_level, _calculate_xp_gain
from app.graphql.queries import Query
from app.services.ai import SentimentResult

# ── Helpers ────────────────────────────────────────────────────────────────

def _make_sentiment(score: float) -> SentimentResult:
    from app.services.ai import _score_to_mood
    mood, color = _score_to_mood(score)
    label = "POSITIVE" if score > 0 else "NEGATIVE" if score < 0 else "NEUTRAL"
    return SentimentResult(score=round(score, 4), mood=mood, color_theme=color, label=label)


@pytest.fixture
def mutation():
    return Mutation()


@pytest.fixture
def query():
    return Query()


# ── XP / Level unit tests ──────────────────────────────────────────────────

def test_xp_gain_minimum():
    assert _calculate_xp_gain(0.0) == 10

def test_xp_gain_maximum():
    assert _calculate_xp_gain(1.0) == 30

def test_xp_gain_is_symmetric():
    assert _calculate_xp_gain(0.5) == _calculate_xp_gain(-0.5)

def test_level_boundaries():
    assert _calculate_level(0)   == 1
    assert _calculate_level(99)  == 1
    assert _calculate_level(100) == 2
    assert _calculate_level(249) == 2
    assert _calculate_level(250) == 3
    assert _calculate_level(499) == 3
    assert _calculate_level(500) == 4
    assert _calculate_level(899) == 4
    assert _calculate_level(900) == 5
    assert _calculate_level(9999) == 5  # capped at max


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


@pytest.mark.asyncio
async def test_create_user_returns_id(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        user = await mutation.create_user(username="idcheck", email="id@check.com")
    assert len(str(user.id)) == 24  # ObjectId string length


# ── login ──────────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_login_existing_user(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        created = await mutation.create_user(username="syncuser", email="sync@test.com")
        user = await mutation.login(username="syncuser")

    assert user.username == "syncuser"
    assert user.email == "sync@test.com"
    assert str(user.id) == str(created.id)


@pytest.mark.asyncio
async def test_login_unknown_user_raises(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.login(username="ghost")
    assert exc_info.value.extensions["code"] == "USER_NOT_FOUND"


@pytest.mark.asyncio
async def test_login_returns_same_id_as_signup(mutation, mock_mongo_db):
    """Web kayıt → mobil giriş aynı user id'yi paylaşmalı (senkron garantisi)."""
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        signed_up = await mutation.create_user(username="demo", email="demo@aura.pet")
        logged_in = await mutation.login(username="demo")
    assert str(signed_up.id) == str(logged_in.id)


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


@pytest.mark.asyncio
async def test_create_pet_sets_color_theme(mutation, mock_mongo_db):
    from app.services.ai import MOOD_COLORS
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pet = await mutation.create_pet(user_id="507f1f77bcf86cd799439011", name="Nova")
    assert pet.color_theme == MOOD_COLORS["NEUTRAL"]


@pytest.mark.asyncio
async def test_create_multiple_pets(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        p1 = await mutation.create_pet(user_id="user1", name="A")
        p2 = await mutation.create_pet(user_id="user1", name="B")
    assert p1.id != p2.id


# ── update_pet ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_update_pet_renames(mutation, mock_mongo_db):
    res = await mock_mongo_db["pets"].insert_one({
        "user_id": "u1", "name": "OldName", "level": 2,
        "xp": 150, "current_mood": "HAPPY", "color_theme": "#FFD700",
    })
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pet = await mutation.update_pet(pet_id=str(res.inserted_id), name="NewName")

    assert pet.name == "NewName"
    assert pet.level == 2   # diğer alanlar korunur
    assert pet.xp == 150
    assert pet.current_mood == "HAPPY"


@pytest.mark.asyncio
async def test_update_pet_invalid_id(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.update_pet(pet_id="not-an-objectid", name="X")
    assert exc_info.value.extensions["code"] == "INVALID_PET_ID"


@pytest.mark.asyncio
async def test_update_pet_not_found(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.update_pet(pet_id="507f1f77bcf86cd799439099", name="X")
    assert exc_info.value.extensions["code"] == "PET_NOT_FOUND"


# ── delete_pet ─────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_delete_pet_removes_pet(mutation, query, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439030"
    res = await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Doomed", "level": 1,
        "xp": 0, "current_mood": "NEUTRAL", "color_theme": "#95A5A6",
    })
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        ok = await mutation.delete_pet(pet_id=str(res.inserted_id))
    assert ok is True

    # Silindikten sonra getUserPets boş dönmeli
    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pets = await query.get_user_pets(user_id=user_id)
    assert pets == []


@pytest.mark.asyncio
async def test_delete_pet_invalid_id(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.delete_pet(pet_id="bad-id")
    assert exc_info.value.extensions["code"] == "INVALID_PET_ID"


@pytest.mark.asyncio
async def test_delete_pet_nonexistent_returns_false(mutation, mock_mongo_db):
    with patch("app.graphql.mutations.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        ok = await mutation.delete_pet(pet_id="507f1f77bcf86cd799439098")
    assert ok is False


# ── add_log_entry — happy path ─────────────────────────────────────────────

@pytest.mark.asyncio
async def test_add_log_entry_updates_pet_mood(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439011"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Aura", "level": 1,
        "xp": 0, "current_mood": "NEUTRAL", "color_theme": "#95A5A6",
    })

    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(0.9)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Bugün harika!")

    assert result.pet.current_mood == "HAPPY"
    assert result.pet.xp == _calculate_xp_gain(0.9)
    assert result.sentiment_label == "POSITIVE"


@pytest.mark.asyncio
async def test_add_log_entry_negative_sets_anxious(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439018"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Storm", "level": 1,
        "xp": 0, "current_mood": "NEUTRAL", "color_theme": "#95A5A6",
    })

    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(-0.95)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Korkunç gün.")

    assert result.pet.current_mood == "ANXIOUS"
    assert result.sentiment_label == "NEGATIVE"


@pytest.mark.asyncio
async def test_add_log_entry_neutral_score(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439019"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Calm", "level": 1,
        "xp": 0, "current_mood": "HAPPY", "color_theme": "#FFD700",
    })

    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(0.0)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Sıradan.")

    assert result.pet.current_mood == "NEUTRAL"
    assert result.sentiment_score == 0.0


# ── add_log_entry — auto-creates pet ──────────────────────────────────────

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
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Çok kötüyüm.")

    assert result.pet.name == "Aura"
    assert result.pet.current_mood == "ANXIOUS"


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
        with pytest.raises(GraphQLError, match="AI modeli"):
            await mutation.add_log_entry(user_id="any", entry_text="test")


# ── add_log_entry — invalid pet_id ───────────────────────────────────────

@pytest.mark.asyncio
async def test_add_log_entry_invalid_pet_id(mutation, mock_mongo_db):
    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(0.5)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        with pytest.raises(GraphQLError) as exc_info:
            await mutation.add_log_entry(
                user_id="507f1f77bcf86cd799439015",
                entry_text="test",
                pet_id="not-a-valid-objectid",
            )
    assert exc_info.value.extensions["code"] == "INVALID_PET_ID"


# ── XP accumulation across entries ───────────────────────────────────────

@pytest.mark.asyncio
async def test_xp_accumulates_across_entries(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439013"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Buddy", "level": 1,
        "xp": 90, "current_mood": "NEUTRAL", "color_theme": "#95A5A6",
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
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Sıradan bir gün.")

    assert result.pet.xp == 100
    assert result.pet.level == 2


@pytest.mark.asyncio
async def test_pet_stays_at_max_level(mutation, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439017"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Nova", "level": 5,
        "xp": 950, "current_mood": "HAPPY", "color_theme": "#FFD700",
    })

    sentiment_mock = MagicMock()
    sentiment_mock.is_loaded = True
    sentiment_mock.analyze.return_value = _make_sentiment(1.0)

    with (
        patch("app.graphql.mutations.mongo") as mock_mongo,
        patch("app.graphql.mutations.sentiment_service", sentiment_mock),
    ):
        mock_mongo.db = mock_mongo_db
        result = await mutation.add_log_entry(user_id=user_id, entry_text="Max level test.")

    assert result.pet.level == 5  # cannot exceed max level


# ── Query tests ────────────────────────────────────────────────────────────

@pytest.mark.asyncio
async def test_get_user_pets_empty(query, mock_mongo_db):
    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pets = await query.get_user_pets(user_id="nonexistent_user")
    assert pets == []


@pytest.mark.asyncio
async def test_get_user_pets_returns_correct_pets(query, mock_mongo_db):
    user_id = "507f1f77bcf86cd799439020"
    other_id = "507f1f77bcf86cd799439021"
    await mock_mongo_db["pets"].insert_one({
        "user_id": user_id, "name": "Mine", "level": 2,
        "xp": 150, "current_mood": "HAPPY", "color_theme": "#FFD700",
    })
    await mock_mongo_db["pets"].insert_one({
        "user_id": other_id, "name": "NotMine", "level": 1,
        "xp": 0, "current_mood": "NEUTRAL", "color_theme": "#95A5A6",
    })

    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        pets = await query.get_user_pets(user_id=user_id)

    assert len(pets) == 1
    assert pets[0].name == "Mine"
    assert pets[0].level == 2


@pytest.mark.asyncio
async def test_get_logs_empty(query, mock_mongo_db):
    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        logs = await query.get_logs(user_id="no_logs_user")
    assert logs == []


@pytest.mark.asyncio
async def test_get_logs_returns_user_logs(query, mock_mongo_db):
    from datetime import datetime, timezone
    user_id = "507f1f77bcf86cd799439022"
    await mock_mongo_db["logs"].insert_one({
        "user_id": user_id,
        "entry_text": "Mutlu bir gündü.",
        "sentiment_score": 0.85,
        "created_at": datetime.now(timezone.utc),
    })

    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        logs = await query.get_logs(user_id=user_id)

    assert len(logs) == 1
    assert logs[0].entry_text == "Mutlu bir gündü."
    assert logs[0].sentiment_score == 0.85


@pytest.mark.asyncio
async def test_get_logs_only_own_logs(query, mock_mongo_db):
    from datetime import datetime, timezone
    user_id = "507f1f77bcf86cd799439023"
    other_id = "507f1f77bcf86cd799439024"
    now = datetime.now(timezone.utc)
    await mock_mongo_db["logs"].insert_one({
        "user_id": user_id, "entry_text": "Mine.",
        "sentiment_score": 0.5, "created_at": now,
    })
    await mock_mongo_db["logs"].insert_one({
        "user_id": other_id, "entry_text": "Not mine.",
        "sentiment_score": 0.1, "created_at": now,
    })

    with patch("app.graphql.queries.mongo") as mock_mongo:
        mock_mongo.db = mock_mongo_db
        logs = await query.get_logs(user_id=user_id)

    assert len(logs) == 1
    assert logs[0].entry_text == "Mine."
