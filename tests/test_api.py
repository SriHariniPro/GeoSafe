import sys
import os
import pytest
from fastapi.testclient import TestClient

# Ensure root directory is on Python path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.main import app

client = TestClient(app)

def test_health_check():
    response = client.get("/api/health")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "ok"
    assert data["database"] == "connected"

def test_get_accidents():
    response = client.get("/api/accidents?limit=5")
    assert response.status_code == 200
    data = response.json()
    assert "total" in data
    assert "accidents" in data
    assert len(data["accidents"]) <= 5

def test_get_hotspots():
    response = client.get("/api/hotspots")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
    if len(data) > 0:
        assert "hotspot_score" in data[0]
        assert "risk_level" in data[0]

def test_risk_prediction():
    payload = {
        "latitude": 13.0405,
        "longitude": 80.2356,
        "road_name": "Anna Salai",
        "area": "Teynampet",
        "time": "18:30",
        "day_of_week": "Friday",
        "weather": "Rain",
        "traffic_level": "Heavy",
        "road_type": "Arterial",
        "speed_limit": 60,
        "construction": "Yes"
    }
    response = client.post("/api/risk/predict", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "risk_score" in data
    assert "risk_level" in data
    assert "explanations" in data
    assert len(data["explanations"]) > 0

def test_what_if_simulation():
    payload = {
        "latitude": 13.0405,
        "longitude": 80.2356,
        "road_name": "Anna Salai",
        "base_time": "18:30",
        "base_traffic": "Medium",
        "base_weather": "Clear",
        "base_construction": "No",
        "sim_time": "18:30",
        "sim_traffic": "Heavy",
        "sim_weather": "Rain",
        "sim_construction": "Yes"
    }
    response = client.post("/api/simulation/what-if", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "base_risk_score" in data
    assert "sim_risk_score" in data
    assert "risk_delta" in data
    assert "summary_reason" in data

def test_safety_route_analysis():
    payload = {
        "origin": "Central Station",
        "destination": "Tambaram"
    }
    response = client.post("/api/routes/analyze", json=payload)
    assert response.status_code == 200
    data = response.json()
    assert "routes" in data
    assert len(data["routes"]) == 3  # FASTEST, BALANCED, SAFEST

def test_authority_interventions():
    response = client.get("/api/interventions")
    assert response.status_code == 200
    data = response.json()
    assert isinstance(data, list)
