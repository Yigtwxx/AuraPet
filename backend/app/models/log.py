from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class LogDocument(BaseModel):
    """MongoDB 'logs' koleksiyonu için döküman modeli."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    entry_text: str
    sentiment_score: float
    created_at: datetime = Field(default_factory=datetime.utcnow)
