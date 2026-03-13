import logging

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

from app.core.config import settings

logger = logging.getLogger(__name__)


class Mongo:
    _client: AsyncIOMotorClient | None = None
    _db: AsyncIOMotorDatabase | None = None

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
