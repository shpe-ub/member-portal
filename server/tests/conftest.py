"""Shared pytest fixtures.

Tests never talk to the real Supabase. Instead we replace (monkeypatch) the
functions that would, so tests are fast and work offline.
"""

import pytest
from flask import g, jsonify

from app import auth, create_app
from app.auth import require_auth

FAKE_USER_ID = "11111111-1111-1111-1111-111111111111"
GOOD_TOKEN = "good-token"


@pytest.fixture
def app(monkeypatch):
    app = create_app(
        {
            "TESTING": True,
            "SUPABASE_URL": "https://fake.supabase.co",
            "SUPABASE_ANON_KEY": "fake-anon-key",
            "SUPABASE_SERVICE_ROLE_KEY": "fake-service-key",
            "FRONTEND_ORIGIN": "http://localhost:3000",
        }
    )

    # Pretend Supabase accepts GOOD_TOKEN and rejects everything else.
    def fake_verify_token(token):
        return FAKE_USER_ID if token == GOOD_TOKEN else None

    monkeypatch.setattr(auth, "verify_token", fake_verify_token)

    # A tiny route used only by tests to check @require_auth.
    @app.get("/api/_whoami")
    @require_auth
    def whoami():
        return jsonify({"id": g.user_id})

    @app.get("/api/_boom")
    def boom():
        raise RuntimeError("secret database details")

    return app


@pytest.fixture
def client(app):
    return app.test_client()


@pytest.fixture
def auth_headers():
    return {"Authorization": f"Bearer {GOOD_TOKEN}"}
