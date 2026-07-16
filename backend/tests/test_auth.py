from fastapi.testclient import TestClient
import sys
import os

# Include app in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json()["project"] == "PathFinder AI"

def test_login_invalid_credentials():
    response = client.post("/api/v1/auth/login-json", json={
        "username": "nonexistent@pathfinder.com",
        "password": "wrongpassword"
      })
    assert response.status_code == 400
    assert "Incorrect email or password" in response.json()["detail"]
