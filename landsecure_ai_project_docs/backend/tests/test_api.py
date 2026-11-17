import os
import sys
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))

import pytest
from fastapi.testclient import TestClient
from app.main import app


@pytest.fixture(scope="session")
def client():
    with TestClient(app) as c:
        yield c


def _login(client, email, password):
    r = client.post("/auth/login", json={"email": email, "password": password})
    if r.status_code != 200:
        client.post("/auth/register", json={"email": email, "password": password, "full_name": "Test", "role": "citizen"})
        r = client.post("/auth/login", json={"email": email, "password": password})
    return r.json()["access_token"]


@pytest.fixture(scope="session")
def officer_token(client):
    client.post("/auth/register", json={"email": "officer@example.com", "password": "password123", "full_name": "Officer", "role": "land_officer"})
    return _login(client, "officer@example.com", "password123")


@pytest.fixture(scope="session")
def citizen_token(client):
    client.post("/auth/register", json={"email": "citizen@example.com", "password": "password123", "full_name": "Citizen", "role": "citizen"})
    return _login(client, "citizen@example.com", "password123")


def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json()["status"] == "ok"


def test_register_and_login(client):
    payload = {"email": "testuser2@example.com", "password": "password123", "full_name": "Test User", "role": "citizen"}
    r = client.post("/auth/register", json=payload)
    assert r.status_code in (201, 409)
    r2 = client.post("/auth/login", json={"email": payload["email"], "password": payload["password"]})
    assert r2.status_code == 200
    assert "access_token" in r2.json()


def test_invalid_token(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
    assert r.status_code == 401


def test_ml_status(client, officer_token):
    r = client.get("/ml/status", headers={"Authorization": f"Bearer {officer_token}"})
    assert r.status_code == 200
    assert r.json()["model_loaded"] is True


def test_ml_predict(client, officer_token):
    payload = {"failed_login_count": 8, "requests_per_minute": 50, "access_outside_normal_hours": 1, "permission_mismatch": 1, "records_modified_short_period": 6, "repeated_requests_same_source": 10, "hash_mismatch": 1, "auth_result": 0}
    r = client.post("/ml/predict", json=payload, headers={"Authorization": f"Bearer {officer_token}"})
    assert r.status_code == 200
    assert r.json()["predicted_class"] in ("suspicious", "normal")


def test_create_record_permission(client, citizen_token):
    payload = {"survey_number": "SV-TEST", "property_location": "Loc", "district": "D", "state": "S", "area": 100, "unit": "sqft", "owner_name": "Owner", "registration_date": "2025-01-01", "status": "active"}
    r = client.post("/records", json=payload, headers={"Authorization": f"Bearer {citizen_token}"})
    assert r.status_code == 403


def test_create_and_verify_record(client, officer_token):
    payload = {"survey_number": "SV-TEST2", "property_location": "Loc", "district": "D", "state": "S", "area": 100, "unit": "sqft", "owner_name": "Owner", "registration_date": "2025-01-01", "status": "active"}
    r = client.post("/records", json=payload, headers={"Authorization": f"Bearer {officer_token}"})
    assert r.status_code == 201
    rid = r.json()["id"]
    v = client.get(f"/records/{rid}/verify", headers={"Authorization": f"Bearer {officer_token}"})
    assert v.status_code == 200
    assert v.json()["verified"] is True


def test_dashboard_stats(client, officer_token):
    r = client.get("/dashboard/stats", headers={"Authorization": f"Bearer {officer_token}"})
    assert r.status_code == 200
    assert "total_records" in r.json()

