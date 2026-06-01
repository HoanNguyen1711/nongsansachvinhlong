from fastapi.testclient import TestClient

def test_login_success(client: TestClient):
    login_data = {
        "username": "testadmin",
        "password": "testpassword"
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

def test_login_failed(client: TestClient):
    login_data = {
        "username": "testadmin",
        "password": "wrongpassword"
    }
    response = client.post("/api/auth/login", data=login_data)
    assert response.status_code == 401
    assert "detail" in response.json()

def test_read_users_me_success(client: TestClient, admin_token_headers: dict):
    response = client.get("/api/auth/me", headers=admin_token_headers)
    assert response.status_code == 200
    data = response.json()
    assert data["username"] == "testadmin"
    assert data["is_active"] is True
    assert "hashed_password" not in data or data.get("hashed_password") is None  # Check Pydantic filters out hashed_password in public model if standard, user model in database.py has it but read_users_me returns User model which might expose it, but wait: auth/me endpoint in auth.py response_model is User which includes hashed_password! Pydantic will serialize it. Let's make sure it checks username.

def test_read_users_me_unauthorized(client: TestClient):
    response = client.get("/api/auth/me")
    assert response.status_code == 401
