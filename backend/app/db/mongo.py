import logging
from typing import Optional

from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from pymongo.errors import OperationFailure

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
        """
        Koleksiyonlar üzerinde gerekli indexleri oluşturur.

        Önemli notlar:
        - `background` parametresi MongoDB 4.2'de deprecated, 5.0'da kaldırıldı;
          modern sürümlerde tüm index oluşturma işlemleri zaten non-blocking çalışır.
        - Mevcut non-unique bir index ile unique bir index çakışırsa (kod 86),
          eski index silinip doğru formda yeniden oluşturulur.
        """
        assert self._db is not None
        db: AsyncIOMotorDatabase = self._db

        async def _create_unique(
            collection: str, key: list, index_name: str
        ) -> None:
            """Unique index oluşturur; çakışma varsa eski indexi silip yeniden kurar."""
            try:
                await db[collection].create_index(key, unique=True)
            except OperationFailure as exc:
                # Kod 86: IndexKeySpecsConflict —
                # aynı isimde non-unique bir index var, unique olarak değiştirilmeli.
                if exc.code == 86:
                    logger.warning(
                        "Index '%s' on '%s' non-unique olarak mevcut — "
                        "siliniyor ve unique olarak yeniden oluşturuluyor.",
                        index_name,
                        collection,
                    )
                    await db[collection].drop_index(index_name)
                    await db[collection].create_index(key, unique=True)
                else:
                    raise

        await _create_unique("users", [("username", _ASC)], "username_1")
        await _create_unique("users", [("email", _ASC)], "email_1")
        await db["pets"].create_index([("user_id", _ASC)])
        await db["logs"].create_index([("user_id", _ASC), ("created_at", _DESC)])
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
