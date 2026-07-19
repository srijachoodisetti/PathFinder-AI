from fastapi.testclient import TestClient
import sys
import os

# Include app in path
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.main import app

client = TestClient(app)

def test_read_root():
    response = client.get("/api")
    assert response.status_code == 200
    assert response.json()["project"] == "PathFinder AI"

def test_protected_route_no_auth():
    # Calling a protected endpoint without auth header should fail
    response = client.get("/api/v1/courses/")
    assert response.status_code == 401

def test_protected_route_invalid_auth():
    # Calling a protected endpoint with invalid header should fail
    response = client.get("/api/v1/courses/", headers={"Authorization": "Bearer invalid_token"})
    assert response.status_code == 401

def test_protected_route_mock_token():
    # Calling a protected endpoint with a test token should successfully authenticate
    # and return the courses list.
    response = client.get("/api/v1/courses/", headers={"Authorization": "Bearer test_token_student@pathfinder.com"})
    assert response.status_code in [200, 404]  # 200 OK or 404 Not Found is fine as long as it's not 401
