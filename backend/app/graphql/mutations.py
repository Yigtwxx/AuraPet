from __future__ import annotations

import logging
from datetime import datetime

import strawberry
from bson import ObjectId

from app.db.mongo import mongo
from app.graphql.schema import Log, Pet, User
from app.models import bson_to_str
from app.models.pet import PetDocument
from app.services.ai import sentiment_service

logger = logging.getLogger(__name__)

# ── XP / Level sistemi ─────────────────────────────────────────────────────

# Her seviyeye geçmek için gereken toplam XP miktarı
_XP_THRESHOLDS: dict[int, int] = {
    1: 0,
    2: 100,
    3: 250,
    4: 500,
    5: 900,
}
_MAX_LEVEL = 5


def _calculate_xp_gain(sentiment_score: float) -> int:
    """
    XP, pozitiflik değil BAĞLILIK (engagement) ödüllendirir.
    Duygu yoğunluğu (abs(score)) ne kadar yüksekse XP o kadar fazladır.

    Formül: 10 (sabit) + abs(score) * 20 → aralık: 10–30 XP
    Bu sayede her not en az 10 XP kazandırır, güçlü duygular 30 XP'e kadar çıkar.
    """
    intensity = abs(sentiment_score)
    return int(10 + intensity * 20)


def _calculate_level(total_xp: int) -> int:
    """Toplam XP miktarına göre mevcut seviyeyi hesaplar."""
    level = 1
    for lvl, threshold in sorted(_XP_THRESHOLDS.items()):
        if total_xp >= threshold:
            level = lvl
    return min(level, _MAX_LEVEL)


# ── Mutation resolver'ları ─────────────────────────────────────────────────


@strawberry.type
class Mutation:

    @strawberry.mutation(
        description=(
            "Yeni bir kullanıcı hesabı oluşturur. "
            "Pet oluşturmadan önce bu mutation çağrılmalıdır."
        )
    )
    async def create_user(self, username: str, email: str) -> User:
        doc = {
            "username": username,
            "email": email,
            "created_at": datetime.utcnow(),
        }
        result = await mongo.db["users"].insert_one(doc)
        logger.info("New user created: id=%s username=%s", result.inserted_id, username)
        return User(
            id=strawberry.ID(str(result.inserted_id)),
            username=username,
            email=email,
            created_at=doc["created_at"].isoformat(),
        )

    @strawberry.mutation(
        description=(
            "Mevcut bir kullanıcı için yeni bir dijital evcil hayvan oluşturur. "
            "Pet başlangıçta NEUTRAL ruh halinde, 1. seviyede ve 0 XP ile başlar."
        )
    )
    async def create_pet(self, user_id: strawberry.ID, name: str) -> Pet:
        doc = {
            "user_id": str(user_id),
            "name": name,
            "level": 1,
            "xp": 0,
            "current_mood": "NEUTRAL",
            "color_theme": "#95A5A6",
        }
        result = await mongo.db["pets"].insert_one(doc)
        logger.info("New pet created: id=%s name=%s user_id=%s", result.inserted_id, name, user_id)
        return Pet(
            id=strawberry.ID(str(result.inserted_id)),
            user_id=user_id,
            name=name,
            level=1,
            xp=0,
            current_mood="NEUTRAL",
            color_theme="#95A5A6",
        )

    @strawberry.mutation(
        description=(
            "Temel mutation. Kullanıcı bir günlük notu gönderir; AI metni analiz eder "
            "ve pet'in ruh hali, rengi, XP'i ve seviyesi otomatik olarak güncellenir. "
            "Güncellenmiş Pet nesnesi döndürülür."
        )
    )
    async def add_log_entry(
        self,
        user_id: strawberry.ID,
        entry_text: str,
    ) -> Pet:
        # Guard: model hazır değilse anlamlı bir hata döndür
        if not sentiment_service.is_loaded:
            raise ValueError(
                "AI modeli henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin."
            )

        # 1. Duygu analizi
        result = sentiment_service.analyze(entry_text)
        logger.info(
            "Sentiment analysis complete — user=%s score=%.4f mood=%s",
            user_id, result.score, result.mood,
        )

        # 2. Log kaydını veritabanına ekle
        log_doc = {
            "user_id": str(user_id),
            "entry_text": entry_text,
            "sentiment_score": result.score,
            "created_at": datetime.utcnow(),
        }
        await mongo.db["logs"].insert_one(log_doc)

        # 3. Kullanıcının petini bul (MVP: ilk pet)
        pet_raw = await mongo.db["pets"].find_one({"user_id": str(user_id)})
        if pet_raw is None:
            raise ValueError(
                f"Kullanıcı (id={user_id}) için kayıtlı pet bulunamadı. "
                "Önce createPet mutation'ını çağırın."
            )
        pet = PetDocument.model_validate(bson_to_str(pet_raw))

        # 4. XP ve seviye hesapla
        xp_gain = _calculate_xp_gain(result.score)
        new_xp = pet.xp + xp_gain
        new_level = _calculate_level(new_xp)

        logger.info(
            "Pet update — name=%s xp: %d → %d  level: %d → %d  mood: %s → %s",
            pet.name, pet.xp, new_xp, pet.level, new_level,
            pet.current_mood, result.mood,
        )

        # 5. Peti güncelle
        await mongo.db["pets"].update_one(
            {"_id": ObjectId(pet.id)},
            {
                "$set": {
                    "xp": new_xp,
                    "level": new_level,
                    "current_mood": result.mood,
                    "color_theme": result.color_theme,
                }
            },
        )

        # 6. Güncellenmiş Pet'i döndür
        return Pet(
            id=strawberry.ID(str(pet.id)),
            user_id=user_id,
            name=pet.name,
            level=new_level,
            xp=new_xp,
            current_mood=result.mood,
            color_theme=result.color_theme,
        )
