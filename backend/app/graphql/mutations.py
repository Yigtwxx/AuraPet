from __future__ import annotations

import logging
import re
from datetime import datetime, timezone

import strawberry
from bson import ObjectId
from graphql import GraphQLError
from pymongo import ReturnDocument
from pymongo.errors import DuplicateKeyError

from app.db.mongo import mongo
from app.graphql.schema import LogAnalysisResult, Pet, User
from app.models import bson_to_str
from app.models.pet import PetDocument
from app.services.ai import MOOD_COLORS, sentiment_service

logger = logging.getLogger(__name__)

# ── Girdi doğrulama ────────────────────────────────────────────────────────
# Backend otoriter doğrulamadır: UI'ı atlayan istemciler de boş/aşırı uzun/
# geçersiz veri gönderemesin. Frontend kuralları (web login/page.tsx) ile uyumlu.

_EMAIL_RE = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")


def _clean_required(
    value: str, *, field: str, label: str, min_len: int = 1, max_len: int
) -> str:
    """Metni trim'ler ve doğrular; geçersizse temiz bir INVALID_INPUT hatası verir."""
    text = (value or "").strip()
    if len(text) < min_len:
        msg = (
            f"{label} boş olamaz."
            if min_len <= 1
            else f"{label} en az {min_len} karakter olmalı."
        )
        raise GraphQLError(msg, extensions={"code": "INVALID_INPUT", "field": field})
    if len(text) > max_len:
        raise GraphQLError(
            f"{label} en fazla {max_len} karakter olabilir.",
            extensions={"code": "INVALID_INPUT", "field": field},
        )
    return text


def _clean_email(value: str) -> str:
    """E-postayı trim'ler ve formatını doğrular."""
    email = (value or "").strip()
    if not email:
        raise GraphQLError(
            "E-posta boş olamaz.",
            extensions={"code": "INVALID_INPUT", "field": "email"},
        )
    if not _EMAIL_RE.match(email):
        raise GraphQLError(
            "Geçerli bir e-posta adresi girin.",
            extensions={"code": "INVALID_INPUT", "field": "email"},
        )
    return email


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
        username = _clean_required(
            username, field="username", label="Kullanıcı adı", min_len=2, max_len=20
        )
        email = _clean_email(email)
        existing = await mongo.db["users"].find_one(
            {"$or": [{"username": username}, {"email": email}]},
            {"username": 1, "email": 1},
        )
        if existing:
            if existing.get("username") == username:
                raise GraphQLError(
                    "Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir tane seçin.",
                    extensions={"code": "USERNAME_TAKEN", "field": "username"},
                )
            raise GraphQLError(
                "Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta kullanın.",
                extensions={"code": "EMAIL_TAKEN", "field": "email"},
            )

        created_at: datetime = datetime.now(timezone.utc)
        doc = {
            "username": username,
            "email": email,
            "created_at": created_at,
        }
        try:
            result = await mongo.db["users"].insert_one(doc)
        except DuplicateKeyError as exc:
            pattern = (exc.details or {}).get("keyPattern", {})
            if "username" in pattern:
                raise GraphQLError(
                    "Bu kullanıcı adı zaten kullanılıyor. Lütfen farklı bir tane seçin.",
                    extensions={"code": "USERNAME_TAKEN", "field": "username"},
                ) from exc
            raise GraphQLError(
                "Bu e-posta adresi zaten kayıtlı. Lütfen farklı bir e-posta kullanın.",
                extensions={"code": "EMAIL_TAKEN", "field": "email"},
            ) from exc

        logger.info("New user created: id=%s username=%s", result.inserted_id, username)
        return User(
            id=strawberry.ID(str(result.inserted_id)),
            username=username,
            email=email,
            created_at=created_at.isoformat(),
        )

    @strawberry.mutation(
        description=(
            "Var olan bir hesaba giriş yapar. Kullanıcı adına göre kullanıcıyı bulur "
            "ve aynı kimliği (user id) döndürür; böylece web ve mobil aynı hesabı "
            "ve aynı verileri paylaşır. Hesap bulunamazsa USER_NOT_FOUND hatası verir."
        )
    )
    async def login(self, username: str) -> User:
        username = _clean_required(
            username, field="username", label="Kullanıcı adı", min_len=1, max_len=50
        )
        doc = await mongo.db["users"].find_one({"username": username})
        if doc is None:
            raise GraphQLError(
                "Hesap bulunamadı. Önce kayıt olun.",
                extensions={"code": "USER_NOT_FOUND", "field": "username"},
            )

        created_at = doc.get("created_at")
        created_at_iso = (
            created_at.isoformat()
            if isinstance(created_at, datetime)
            else str(created_at)
        )
        logger.info("User login: id=%s username=%s", doc["_id"], username)
        return User(
            id=strawberry.ID(str(doc["_id"])),
            username=doc["username"],
            email=doc["email"],
            created_at=created_at_iso,
        )

    @strawberry.mutation(
        description=(
            "Mevcut bir kullanıcı için yeni bir dijital evcil hayvan oluşturur. "
            "Pet başlangıçta NEUTRAL ruh halinde, 1. seviyede ve 0 XP ile başlar."
        )
    )
    async def create_pet(self, user_id: strawberry.ID, name: str) -> Pet:
        name = _clean_required(name, field="name", label="Aurion adı", min_len=1, max_len=20)
        doc = {
            "user_id": str(user_id),
            "name": name,
            "level": 1,
            "xp": 0,
            "current_mood": "NEUTRAL",
            "color_theme": MOOD_COLORS["NEUTRAL"],
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
            color_theme=MOOD_COLORS["NEUTRAL"],
        )

    @strawberry.mutation(
        description=(
            "Mevcut bir pet'in adını günceller. Diğer alanlar (seviye, XP, ruh hali) "
            "korunur. Güncellenmiş Pet nesnesi döndürülür."
        )
    )
    async def update_pet(self, pet_id: strawberry.ID, name: str) -> Pet:
        name = _clean_required(name, field="name", label="Aurion adı", min_len=1, max_len=20)
        try:
            pet_oid = ObjectId(str(pet_id))
        except Exception as exc:
            raise GraphQLError(
                f"Geçersiz pet_id: {pet_id}",
                extensions={"code": "INVALID_PET_ID"},
            ) from exc

        updated = await mongo.db["pets"].find_one_and_update(
            {"_id": pet_oid},
            {"$set": {"name": name}},
            return_document=ReturnDocument.AFTER,
        )
        if updated is None:
            raise GraphQLError(
                "Güncellenecek pet bulunamadı.",
                extensions={"code": "PET_NOT_FOUND"},
            )

        pet = PetDocument.model_validate(bson_to_str(updated))
        assert pet.id is not None
        logger.info("Pet renamed: id=%s name=%s", pet.id, name)
        return Pet(
            id=strawberry.ID(pet.id),
            user_id=strawberry.ID(pet.user_id),
            name=pet.name,
            level=pet.level,
            xp=pet.xp,
            current_mood=pet.current_mood,
            color_theme=pet.color_theme,
        )

    @strawberry.mutation(
        description=(
            "Bir pet'i kalıcı olarak siler. Silme başarılıysa true, "
            "böyle bir pet yoksa false döndürür."
        )
    )
    async def delete_pet(self, pet_id: strawberry.ID) -> bool:
        try:
            pet_oid = ObjectId(str(pet_id))
        except Exception as exc:
            raise GraphQLError(
                f"Geçersiz pet_id: {pet_id}",
                extensions={"code": "INVALID_PET_ID"},
            ) from exc

        result = await mongo.db["pets"].delete_one({"_id": pet_oid})
        deleted = result.deleted_count > 0
        if deleted:
            logger.info("Pet deleted: id=%s", pet_id)
        return deleted

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
        pet_id: strawberry.ID | None = strawberry.UNSET,
    ) -> LogAnalysisResult:
        # Girdi doğrulama: boş/whitespace veya aşırı uzun metni reddet (REST /analyze
        # ile aynı 2000 sınırı — modeli/DB'yi şişmeden korur).
        entry_text = _clean_required(
            entry_text, field="entryText", label="Günlük metni", min_len=1, max_len=2000
        )

        # Guard: model hazır değilse anlamlı bir hata döndür
        if not sentiment_service.is_loaded:
            raise GraphQLError(
                "AI modeli henüz hazır değil. Lütfen birkaç saniye bekleyip tekrar deneyin.",
                extensions={"code": "AI_MODEL_UNAVAILABLE"},
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
            "created_at": datetime.now(timezone.utc),
        }
        await mongo.db["logs"].insert_one(log_doc)

        # 3. Kullanıcının petini bul; pet_id belirtilmişse onu, yoksa ilk peti kullan
        if pet_id and pet_id is not strawberry.UNSET:
            try:
                pet_oid_lookup = ObjectId(str(pet_id))
            except Exception as exc:
                raise GraphQLError(
                    f"Geçersiz pet_id: {pet_id}",
                    extensions={"code": "INVALID_PET_ID"},
                ) from exc
            pet_raw = await mongo.db["pets"].find_one(
                {"_id": pet_oid_lookup, "user_id": str(user_id)}
            )
        else:
            pet_raw = await mongo.db["pets"].find_one({"user_id": str(user_id)})
        if pet_raw is None:
            logger.info("No pet found for user=%s — auto-creating 'Aura'", user_id)
            auto_doc = {
                "user_id": str(user_id),
                "name": "Aura",
                "level": 1,
                "xp": 0,
                "current_mood": "NEUTRAL",
                "color_theme": MOOD_COLORS["NEUTRAL"],
            }
            insert_result = await mongo.db["pets"].insert_one(auto_doc)
            pet_raw = await mongo.db["pets"].find_one({"_id": insert_result.inserted_id})
        assert pet_raw is not None
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
        try:
            pet_oid = ObjectId(pet.id)
        except Exception as exc:
            raise ValueError(f"Geçersiz pet kimliği: {pet.id}") from exc

        await mongo.db["pets"].update_one(
            {"_id": pet_oid},
            {
                "$set": {
                    "xp": new_xp,
                    "level": new_level,
                    "current_mood": result.mood,
                    "color_theme": result.color_theme,
                }
            },
        )

        # 6. Güncellenmiş Pet ve sentiment etiketini döndür
        return LogAnalysisResult(
            pet=Pet(
                id=strawberry.ID(str(pet.id)),
                user_id=user_id,
                name=pet.name,
                level=new_level,
                xp=new_xp,
                current_mood=result.mood,
                color_theme=result.color_theme,
            ),
            sentiment_label=result.label,
            sentiment_score=result.score,
        )
