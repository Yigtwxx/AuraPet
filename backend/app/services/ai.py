from __future__ import annotations

import torch
from dataclasses import dataclass
from transformers import pipeline

MODEL_ID = "saribasmetehan/bert-base-turkish-sentiment-analysis"


@dataclass
class SentimentResult:
    score: float       # -1.0 (very negative) to +1.0 (very positive)
    mood: str          # HAPPY | NEUTRAL | SAD | ANXIOUS
    color_theme: str   # hex color driven by mood


class SentimentService:
    """Loads the Turkish BERT sentiment model once and exposes analyze()."""

    def __init__(self) -> None:
        self._pipe = None

    def load(self) -> None:
        device = "mps" if torch.backends.mps.is_available() else "cpu"
        self._pipe = pipeline(
            "text-classification",
            model=MODEL_ID,
            device=device,
        )

    def analyze(self, text: str) -> SentimentResult:
        if self._pipe is None:
            raise RuntimeError("SentimentService not loaded. Call load() first.")

        result = self._pipe(text, truncation=True, max_length=512)[0]
        label: str = result["label"].lower()   # "positive" | "negative" | "neutral"
        conf: float = result["score"]          # 0.0 – 1.0

        if label == "positive":
            score = conf
        elif label == "negative":
            score = -conf
        else:
            score = 0.0

        mood, color = _score_to_mood(score)
        return SentimentResult(score=round(score, 4), mood=mood, color_theme=color)


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
