from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class UserDocument(BaseModel):
    """MongoDB 'users' koleksiyonu için döküman modeli."""

    model_config = ConfigDict(populate_by_name=True)

    id: str | None = Field(default=None, alias="_id")
    username: str
    email: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
