from __future__ import annotations

from pydantic import BaseModel, ConfigDict, Field


class PetDocument(BaseModel):
    """MongoDB 'pets' koleksiyonu için döküman modeli."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = Field(default=None, alias="_id")
    user_id: str
    name: str
    level: int = 1
    xp: int = 0
    current_mood: str = "NEUTRAL"   # HAPPY | NEUTRAL | SAD | ANXIOUS
    color_theme: str = "#95A5A6"
