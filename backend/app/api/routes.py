from __future__ import annotations

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from app.db.mongo import mongo
from app.services.ai import sentiment_service

router = APIRouter()


# ── Response / Request models ──────────────────────────────────────────────


class HealthResponse(BaseModel):
    status: str
    mongo: str
    model: str   # "loaded" | "not_loaded" | "error"


class AnalyzeRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        max_length=2000,
        description="Duygu analizi yapılacak Türkçe metin.",
    )


class AnalyzeResponse(BaseModel):
    score: float = Field(..., description="Duygu skoru: -1.0 (çok negatif) → +1.0 (çok pozitif)")
    mood: str = Field(..., description="HAPPY | NEUTRAL | SAD | ANXIOUS")
    color_theme: str = Field(..., description="Ruh haline karşılık gelen hex renk kodu")
    text_preview: str = Field(..., description="Gönderilen metnin ilk 80 karakteri")


# ── Endpoints ──────────────────────────────────────────────────────────────


@router.get(
    "/health",
    response_model=HealthResponse,
    summary="Sistem durum kontrolü",
    tags=["System"],
)
async def health() -> HealthResponse:
    """MongoDB bağlantısını ve AI modelinin yüklenme durumunu döndürür."""
    mongo_status = "connected" if await mongo.ping() else "disconnected"

    if sentiment_service.is_loaded:
        model_status = "loaded"
    elif sentiment_service._load_error:
        model_status = "error"
    else:
        model_status = "not_loaded"

    return HealthResponse(status="ok", mongo=mongo_status, model=model_status)


@router.post(
    "/analyze",
    response_model=AnalyzeResponse,
    summary="Türkçe metin duygu analizi",
    tags=["AI"],
)
async def analyze(body: AnalyzeRequest) -> AnalyzeResponse:
    """
    Verilen Türkçe metni Türkçe BERT modeliyle analiz eder ve
    duygu skoru, ruh hali ve renk teması döndürür.
    """
    if not sentiment_service.is_loaded:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="AI modeli henüz yüklenmedi. Birkaç saniye bekleyip tekrar deneyin.",
        )

    result = sentiment_service.analyze(body.text)

    return AnalyzeResponse(
        score=result.score,
        mood=result.mood,
        color_theme=result.color_theme,
        text_preview=body.text[:80],
    )
