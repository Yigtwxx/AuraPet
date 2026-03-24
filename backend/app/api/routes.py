from fastapi import APIRouter
from pydantic import BaseModel

from app.db.mongo import mongo

router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    mongo: str


@router.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    mongo_status = "connected" if await mongo.ping() else "disconnected"
    return HealthResponse(status="ok", mongo=mongo_status)
