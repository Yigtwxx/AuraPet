from __future__ import annotations

import logging
import torch
from dataclasses import dataclass
from transformers import pipeline

logger = logging.getLogger(__name__)

MODEL_ID = "saribasmetehan/bert-base-turkish-sentiment-analysis"


@dataclass
class SentimentResult:
    score: float       # -1.0 (very negative) to +1.0 (very positive)
    mood: str          # HAPPY | NEUTRAL | SAD | ANXIOUS
    color_theme: str   # hex color driven by mood


_NEUTRAL_FALLBACK = SentimentResult(score=0.0, mood="NEUTRAL", color_theme="#95A5A6")


class SentimentService:
    """Loads the Turkish BERT sentiment model once and exposes analyze()."""

    def __init__(self) -> None:
        self._pipe = None
        self._load_error: str | None = None

    @property
    def is_loaded(self) -> bool:
        return self._pipe is not None

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
            label: str = raw["label"].lower()   # "positive" | "negative" | "neutral"
            conf: float = raw["score"]          # 0.0 – 1.0

            if label == "positive":
                score = conf
            elif label == "negative":
                score = -conf
            else:
                score = 0.0

            mood, color = _score_to_mood(score)
            return SentimentResult(score=round(score, 4), mood=mood, color_theme=color)

        except Exception:
            logger.exception("Sentiment analysis failed; returning neutral fallback.")
            return _NEUTRAL_FALLBACK


def _score_to_mood(score: float) -> tuple[str, str]:
    if score > 0.25:
        return "HAPPY",   "#FFD700"  # altın sarısı
    if score >= -0.25:
        return "NEUTRAL", "#95A5A6"  # gri
    if score >= -0.65:
        return "SAD",     "#5B9BD5"  # mavi
    return "ANXIOUS",     "#9B59B6"  # mor


# Module-level singleton — imported and reused across the app
sentiment_service = SentimentService()
