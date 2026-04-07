from __future__ import annotations

import strawberry


@strawberry.type(
    description="AuraPet'e kayıtlı bir kullanıcı hesabı."
)
class User:
    id: strawberry.ID
    username: str
    email: str
    created_at: str  # ISO-8601 formatında tarih


@strawberry.type(
    description=(
        "Dijital evcil hayvan. Kullanıcının günlük notlarındaki duygu durumuna "
        "göre ruh hali, renk, XP ve level dinamik olarak evrilir."
    )
)
class Pet:
    id: strawberry.ID
    user_id: strawberry.ID
    name: str
    level: int
    xp: int
    current_mood: str   # HAPPY | NEUTRAL | SAD | ANXIOUS
    color_theme: str    # Ruh haline karşılık gelen hex renk kodu


@strawberry.type(
    description="Kullanıcının yazdığı günlük not ve AI tarafından hesaplanan duygu skoru."
)
class Log:
    id: strawberry.ID
    user_id: strawberry.ID
    entry_text: str
    sentiment_score: float  # -1.0 (çok negatif) → +1.0 (çok pozitif)
    created_at: str          # ISO-8601 formatında tarih
