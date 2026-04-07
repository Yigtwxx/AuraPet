from __future__ import annotations

import strawberry
from typing import List

from app.db.mongo import mongo
from app.graphql.schema import Log, Pet
from app.models import bson_to_str
from app.models.log import LogDocument
from app.models.pet import PetDocument


@strawberry.type
class Query:

    @strawberry.field(
        description="Bir kullanıcıya ait tüm evcil hayvanları döndürür."
    )
    async def get_user_pets(self, user_id: strawberry.ID) -> List[Pet]:
        cursor = mongo.db["pets"].find({"user_id": str(user_id)})
        pets: List[Pet] = []
        async for doc in cursor:
            pet_doc = PetDocument.model_validate(bson_to_str(doc))
            pets.append(
                Pet(
                    id=strawberry.ID(pet_doc.id),
                    user_id=strawberry.ID(pet_doc.user_id),
                    name=pet_doc.name,
                    level=pet_doc.level,
                    xp=pet_doc.xp,
                    current_mood=pet_doc.current_mood,
                    color_theme=pet_doc.color_theme,
                )
            )
        return pets

    @strawberry.field(
        description=(
            "Bir kullanıcıya ait tüm günlük notları en yeniden en eskiye "
            "sıralayarak döndürür."
        )
    )
    async def get_logs(self, user_id: strawberry.ID) -> List[Log]:
        cursor = mongo.db["logs"].find(
            {"user_id": str(user_id)},
            sort=[("created_at", -1)],
        )
        logs: List[Log] = []
        async for doc in cursor:
            log_doc = LogDocument.model_validate(bson_to_str(doc))
            logs.append(
                Log(
                    id=strawberry.ID(log_doc.id),
                    user_id=strawberry.ID(log_doc.user_id),
                    entry_text=log_doc.entry_text,
                    sentiment_score=log_doc.sentiment_score,
                    created_at=log_doc.created_at.isoformat(),
                )
            )
        return logs
