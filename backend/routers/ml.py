import os
import json
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.config import settings
from backend.ml.train import train_and_save_models

router = APIRouter(prefix="/api/ml", tags=["Machine Learning"])

@router.post("/train")
def train_model_endpoint(db: Session = Depends(get_db)):
    metrics = train_and_save_models(db)
    return {
        "message": "Random Forest model retrained successfully.",
        "metrics": metrics
    }

@router.get("/performance")
def get_model_performance():
    metrics_path = os.path.join(settings.MODEL_DIR, "ml_metrics.json")
    if not os.path.exists(metrics_path):
        metrics = train_and_save_models()
        return metrics
    with open(metrics_path, "r") as f:
        metrics = json.load(f)
    return metrics

@router.get("/features")
def get_feature_info():
    return {
        "target": "Risk_Label & Risk_Score",
        "model_type": "Random Forest Classifier & Regressor",
        "clustering_algorithm": "DBSCAN (Density-Based Spatial Clustering of Applications with Noise)",
        "explanation_method": "Tree Feature Attribution & Local Permutation Importance",
        "features": [
            {"name": "hour", "type": "int", "description": "Hour of the day (0-23)"},
            {"name": "is_weekend", "type": "binary", "description": "1 if Saturday/Sunday else 0"},
            {"name": "is_night", "type": "binary", "description": "1 if hour >= 20 or <= 5"},
            {"name": "is_peak_hour", "type": "binary", "description": "1 if morning or evening rush hour"},
            {"name": "weather_code", "type": "categorical", "description": "Encodes Clear, Cloudy, Fog, Rain, Heavy Rain"},
            {"name": "traffic_code", "type": "categorical", "description": "Encodes Low, Medium, High, Heavy, Congested"},
            {"name": "road_type_code", "type": "categorical", "description": "Encodes Local, Collector, Arterial, Highway"},
            {"name": "speed_limit", "type": "int", "description": "Designated road speed limit in km/h"},
            {"name": "construction_code", "type": "binary", "description": "1 if active road construction zone"},
            {"name": "visibility", "type": "float", "description": "Atmospheric visibility distance in km"},
            {"name": "temperature", "type": "float", "description": "Ambient temperature in Celsius"},
            {"name": "traffic_severity_index", "type": "derived", "description": "Combined traffic level and speed ratio"},
            {"name": "weather_risk_index", "type": "derived", "description": "Combined weather severity and inverse visibility"}
        ]
    }
