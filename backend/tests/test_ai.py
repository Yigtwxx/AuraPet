"""Tests for AI service pure functions — no model loading required."""
from __future__ import annotations

import pytest

from app.graphql.mutations import _calculate_level, _calculate_xp_gain
from app.services.ai import MOOD_COLORS, SentimentResult, SentimentService, _score_to_mood

# ── _score_to_mood ─────────────────────────────────────────────────────────

@pytest.mark.parametrize("score,expected_mood", [
    (1.0,  "HAPPY"),
    (0.26, "HAPPY"),
    (0.25, "NEUTRAL"),   # boundary: <= 0.25 is NEUTRAL
    (0.0,  "NEUTRAL"),
    (-0.25, "NEUTRAL"),  # boundary: >= -0.25 is NEUTRAL
    (-0.26, "SAD"),
    (-0.65, "SAD"),      # boundary: >= -0.65 is SAD
    (-0.66, "ANXIOUS"),
    (-1.0,  "ANXIOUS"),
])
def test_score_to_mood(score, expected_mood):
    mood, color = _score_to_mood(score)
    assert mood == expected_mood
    assert color == MOOD_COLORS[expected_mood]


def test_mood_colors_complete():
    for mood in ("HAPPY", "NEUTRAL", "SAD", "ANXIOUS"):
        assert mood in MOOD_COLORS
        assert MOOD_COLORS[mood].startswith("#")


# ── _calculate_xp_gain ────────────────────────────────────────────────────

@pytest.mark.parametrize("score,expected_xp", [
    (0.0,  10),   # neutral: minimum XP
    (1.0,  30),   # strong positive: maximum XP
    (-1.0, 30),   # strong negative: maximum XP (engagement-based)
    (0.5,  20),
    (-0.5, 20),
])
def test_xp_gain(score, expected_xp):
    assert _calculate_xp_gain(score) == expected_xp


# ── _calculate_level ──────────────────────────────────────────────────────

@pytest.mark.parametrize("xp,expected_level", [
    (0,    1),
    (99,   1),
    (100,  2),
    (249,  2),
    (250,  3),
    (499,  3),
    (500,  4),
    (899,  4),
    (900,  5),
    (9999, 5),   # capped at MAX_LEVEL
])
def test_calculate_level(xp, expected_level):
    assert _calculate_level(xp) == expected_level


# ── SentimentService fallback ─────────────────────────────────────────────

def test_sentiment_fallback_when_not_loaded():
    svc = SentimentService()
    assert not svc.is_loaded
    result = svc.analyze("test")
    assert isinstance(result, SentimentResult)
    assert result.mood == "NEUTRAL"
    assert result.score == 0.0


def test_load_error_initially_none():
    svc = SentimentService()
    assert svc.load_error is None
