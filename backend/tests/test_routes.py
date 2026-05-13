"""REST route tests using HTTPX AsyncClient with mocked dependencies."""
from __future__ import annotations

import pytest
from unittest.mock import AsyncMock, MagicMock, patch
from httpx import AsyncClient, ASGITransport


@pytest.fixture
async def client():
    """FastAPI test client with MongoDB and AI service mocked."""
    with (
        patch("app.db.mongo.mongo.connect", new_callable=AsyncMock),
        patch("app.db.mongo.mongo.disconnect", new_callable=AsyncMock),
        patch("app.db.mongo.mongo.ping", new_callable=AsyncMock, return_value=True),
        patch("app.services.ai.sentiment_service.load"),
    ):
        from app.main import app
        async with AsyncClient(
            transport=ASGITransport(app=app), base_url="http://test"
        ) as ac:
            yield ac


@pytest.mark.asyncio
async def test_health_returns_ok(client):
    with patch("app.api.routes.sentiment_service") as mock_svc:
        mock_svc.is_loaded = True
        mock_svc.load_error = None
        resp = await client.get("/api/health")
    assert resp.status_code == 200
    body = resp.json()
    assert body["status"] == "ok"
    assert body["mongo"] == "connected"
    assert body["model"] == "loaded"


@pytest.mark.asyncio
async def test_health_model_not_loaded(client):
    with patch("app.api.routes.sentiment_service") as mock_svc:
        mock_svc.is_loaded = False
        mock_svc.load_error = None
        resp = await client.get("/api/health")
    assert resp.status_code == 200
    assert resp.json()["model"] == "not_loaded"


@pytest.mark.asyncio
async def test_analyze_returns_503_when_model_not_loaded(client):
    with patch("app.api.routes.sentiment_service") as mock_svc:
        mock_svc.is_loaded = False
        resp = await client.post("/api/analyze", json={"text": "merhaba"})
    assert resp.status_code == 503


@pytest.mark.asyncio
async def test_analyze_returns_result(client):
    from app.services.ai import SentimentResult
    mock_result = SentimentResult(score=0.85, mood="HAPPY", color_theme="#FFD700")

    with patch("app.api.routes.sentiment_service") as mock_svc:
        mock_svc.is_loaded = True
        mock_svc.analyze.return_value = mock_result
        resp = await client.post("/api/analyze", json={"text": "Bugün çok mutluyum!"})

    assert resp.status_code == 200
    body = resp.json()
    assert body["mood"] == "HAPPY"
    assert body["score"] == 0.85
    assert body["color_theme"] == "#FFD700"


@pytest.mark.asyncio
async def test_analyze_validates_empty_text(client):
    with patch("app.api.routes.sentiment_service") as mock_svc:
        mock_svc.is_loaded = True
        resp = await client.post("/api/analyze", json={"text": ""})
    assert resp.status_code == 422
