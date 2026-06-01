import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

_ASC = 1
_DESC = -1

logger = logging.getLogger(__name__)


class Mongo:
    _client: Optional[AsyncIOMotorClient] = None
    _db: Optional[AsyncIOMotorDatabase] = None

    @property
    def db(self) -> AsyncIOMotorDatabase:
        if self._db is None:
            raise RuntimeError("MongoDB is not connected. Call connect() first.")
        return self._db

    async def connect(self) -> None:
        self._client = AsyncIOMotorClient(settings.mongo_uri)
        await self._client.admin.command("ping")
        self._db = self._client[settings.mongo_db_name]
        logger.info("Connected to MongoDB at %s", settings.mongo_uri)
        await self._ensure_indexes()

    async def _ensure_indexes(self) -> None:
        assert self._db is not None
        db: AsyncIOMotorDatabase = self._db
        await db["users"].create_index([("username", _ASC)], unique=True, background=True)
        await db["users"].create_index([("email", _ASC)], unique=True, background=True)
        await db["pets"].create_index([("user_id", _ASC)], background=True)
        await db["logs"].create_index(
            [("user_id", _ASC), ("created_at", _DESC)], background=True
        )
        logger.info("MongoDB indexes ensured.")

    async def disconnect(self) -> None:
        if self._client is not None:
            self._client.close()
            logger.info("Disconnected from MongoDB.")
        self._client = None
        self._db = None

    async def ping(self) -> bool:
        try:
            if self._client is None:
                return False
            await self._client.admin.command("ping")
            return True
        except Exception:
            return False


mongo = Mongo()
