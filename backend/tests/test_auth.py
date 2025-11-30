import httpx
import pytest


def test_register_and_login():
    client = httpx.Client(base_url="http://127.0.0.1:8000")

    # register
    r = client.post("/auth/register", json={"email": "test@example.com", "password": "secret", "name": "T"})
    assert r.status_code == 200
    data = r.json()
    assert data["email"] == "test@example.com"

    # login (form data)
    r2 = client.post("/auth/login", data={"username": "test@example.com", "password": "secret"})
    assert r2.status_code == 200
    tok = r2.json()
    assert "access_token" in tok and "refresh_token" in tok

    # use refresh to rotate
    r3 = client.post("/auth/refresh", json={"refresh_token": tok["refresh_token"]})
    assert r3.status_code == 200
    tok2 = r3.json()
    assert "access_token" in tok2 and "refresh_token" in tok2
