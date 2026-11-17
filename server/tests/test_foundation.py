from tests.conftest import FAKE_USER_ID


def test_whoami_without_token_is_401(client):
    response = client.get("/api/_whoami")
    assert response.status_code == 401
    assert "error" in response.get_json()


def test_whoami_with_malformed_header_is_401(client):
    response = client.get("/api/_whoami", headers={"Authorization": "Token abc"})
    assert response.status_code == 401


def test_whoami_with_invalid_token_is_401(client):
    response = client.get("/api/_whoami", headers={"Authorization": "Bearer nope"})
    assert response.status_code == 401


def test_whoami_with_valid_token_returns_user_id(client, auth_headers):
    response = client.get("/api/_whoami", headers=auth_headers)
    assert response.status_code == 200
    assert response.get_json() == {"id": FAKE_USER_ID}


def test_unknown_route_returns_json_404(client):
    response = client.get("/api/does-not-exist")
    assert response.status_code == 404
    assert response.get_json() == {"error": "route not found"}


def test_unexpected_error_returns_json_500_without_details(client):
    response = client.get("/api/_boom")
    assert response.status_code == 500
    assert response.get_json() == {"error": "internal server error"}


def test_cors_allows_only_frontend_origin(client):
    allowed = client.get("/api/health", headers={"Origin": "http://localhost:3000"})
    assert allowed.headers.get("Access-Control-Allow-Origin") == "http://localhost:3000"

    blocked = client.get("/api/health", headers={"Origin": "https://evil.example"})
    assert blocked.headers.get("Access-Control-Allow-Origin") is None
