from __future__ import annotations

import asyncio
from unittest.mock import MagicMock

import pytest


@pytest.fixture(scope="session")
def event_loop_policy():
    return asyncio.DefaultEventLoopPolicy()


@pytest.fixture
def mock_mongo_db():
    """In-memory dict-backed mock for mongo.db collections."""
    db = {}

    def collection(name):
        if name not in db:
            db[name] = _MockCollection()
        return db[name]

    mock = MagicMock()
    mock.__getitem__ = lambda self, name: collection(name)
    return mock


class _MockCollection:
    """Minimal async collection mock backed by a plain list."""

    def __init__(self):
        self._docs: list[dict] = []
        self._next_id = 0

    async def insert_one(self, doc: dict):
        from bson import ObjectId
        oid = ObjectId()
        stored = dict(doc)
        stored["_id"] = oid
        self._docs.append(stored)
        result = MagicMock()
        result.inserted_id = oid
        return result

    async def find_one(self, query: dict, projection=None):
        for doc in self._docs:
            if self._matches(doc, query):
                return doc
        return None

    async def update_one(self, query: dict, update: dict):
        for doc in self._docs:
            if self._matches(doc, query):
                if "$set" in update:
                    doc.update(update["$set"])
                break

    async def create_index(self, *args, **kwargs):
        pass

    def find(self, query: dict, sort=None):
        return _MockCursor([d for d in self._docs if self._matches(d, query)])

    def _matches(self, doc: dict, query: dict) -> bool:
        for k, v in query.items():
            if k == "$or":
                if not any(self._matches(doc, clause) for clause in v):
                    return False
            elif str(doc.get(k)) != str(v) and doc.get(k) != v:
                return False
        return True


class _MockCursor:
    def __init__(self, docs):
        self._docs = docs
        self._idx = 0

    def __aiter__(self):
        return self

    async def __anext__(self):
        if self._idx >= len(self._docs):
            raise StopAsyncIteration
        doc = self._docs[self._idx]
        self._idx += 1
        return doc
