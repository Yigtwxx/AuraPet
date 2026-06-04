from __future__ import annotations

import logging
from dataclasses import dataclass
from typing import Any, Callable

import torch
from transformers import pipeline

logger = logging.getLogger(__name__)

MODEL_ID = "saribasmetehan/bert-base-turkish-sentiment-analysis"

# Canonical mood→color mapping — single source of truth for backend and models
MOOD_COLORS: dict[str, str] = {
    "HAPPY":   "#FFD700",
    "NEUTRAL": "#95A5A6",
    "SAD":     "#5B9BD5",
    "ANXIOUS": "#9B59B6",
}


@dataclass
class SentimentResult:
    score: float       # -1.0 (very negative) to +1.0 (very positive)
    mood: str          # HAPPY | NEUTRAL | SAD | ANXIOUS
    color_theme: str   # hex color driven by mood
    label: str         # POSITIVE | NEGATIVE | NEUTRAL (raw 3-class)


_NEUTRAL_FALLBACK = SentimentResult(
    score=0.0, mood="NEUTRAL", color_theme=MOOD_COLORS["NEUTRAL"], label="NEUTRAL"
)


class SentimentService:
    """Loads the Turkish BERT sentiment model once and exposes analyze()."""

    def __init__(self) -> None:
        self._pipe: Callable[..., Any] | None = None
        self._load_error: str | None = None

    @property
    def is_loaded(self) -> bool:
        return self._pipe is not None

    @property
    def load_error(self) -> str | None:
        return self._load_error

    def load(self) -> None:
        """Load the model. Called once at application startup via lifespan."""
        try:
            device = "mps" if torch.backends.mps.is_available() else "cpu"
            logger.info("Loading sentiment model '%s' on device '%s'", MODEL_ID, device)
            self._pipe = pipeline(
                "text-classification",
                model=MODEL_ID,
                device=device,
            )
            logger.info("Sentiment model loaded successfully.")
        except Exception as exc:
            self._load_error = str(exc)
            logger.error("Failed to load sentiment model: %s", exc)
            raise

    def analyze(self, text: str) -> SentimentResult:
        """
        Analyze Turkish text and return a SentimentResult.
        Returns a neutral fallback if the model is not loaded or throws.
        """
        if self._pipe is None:
            logger.warning("analyze() called before model is loaded; returning neutral fallback.")
            return _NEUTRAL_FALLBACK

        try:
            raw = self._pipe(text, truncation=True, max_length=512)[0]
            raw_label: str = raw["label"]   # e.g. "LABEL_0" | "LABEL_1" | "LABEL_2"
            conf: float = raw["score"]      # 0.0 – 1.0

            # Model saribasmetehan/bert-base-turkish-sentiment-analysis
            # id2label: {0: LABEL_0=NEUTRAL, 1: LABEL_1=POSITIVE, 2: LABEL_2=NEGATIVE}
            # (Doğrulama: inference test sonuçlarıyla belirlendi)
            label_map: dict[str, str] = {
                "LABEL_0": "NEUTRAL",
                "LABEL_1": "POSITIVE",
                "LABEL_2": "NEGATIVE",
            }
            canonical = label_map.get(raw_label.upper(), raw_label.upper())

            if canonical == "POSITIVE":
                score = conf
            elif canonical == "NEGATIVE":
                score = -conf
            else:
                score = 0.0

            mood, color = _score_to_mood(score)
            return SentimentResult(
                score=round(score, 4),
                mood=mood,
                color_theme=color,
                label=canonical,   # "POSITIVE" | "NEGATIVE" | "NEUTRAL"
            )

        except Exception:
            logger.exception("Sentiment analysis failed; returning neutral fallback.")
            return _NEUTRAL_FALLBACK


def _score_to_mood(score: float) -> tuple[str, str]:
    if score > 0.25:
        mood = "HAPPY"
    elif score >= -0.25:
        mood = "NEUTRAL"
    elif score >= -0.65:
        mood = "SAD"
    else:
        mood = "ANXIOUS"
    return mood, MOOD_COLORS[mood]


# Module-level singleton — imported and reused across the app
sentiment_service = SentimentService()
