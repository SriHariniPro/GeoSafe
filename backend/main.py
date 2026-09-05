import os
from fastapi import FastAPI, Depends, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session

from backend.config import settings
from backend.database import Base, engine, get_db
from backend.models import Accident, User, Hotspot
from backend.utils.data_loader import seed_default_users, load_accidents_from_excel
from backend.services.hotspot_detection import run_dbscan_hotspot_detection
from backend.ml.train import train_and_save_models

from backend.routers import (
    auth, accidents, hotspots, risk, simulation, 
    routes, interventions, analytics, dashboard, ml
)

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.PROJECT_VERSION,
    description="GeoSafe: An Explainable Spatiotemporal AI System for Road Accident Hotspot Prediction and Safety-Aware Route Optimization"
)

# Enable CORS for local Vite frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router)
app.include_router(accidents.router)
app.include_router(hotspots.router)
app.include_router(risk.router)
app.include_router(simulation.router)
app.include_router(routes.router)
app.include_router(interventions.router)
app.include_router(analytics.router)
app.include_router(dashboard.router)
app.include_router(ml.router)

@app.on_event("startup")
def startup_event():
    # 1. Create DB Tables
    Base.metadata.create_all(bind=engine)

    # 2. Seed Default Users & Ingest Excel Dataset if empty
    from backend.database import SessionLocal
    db = SessionLocal()
    try:
        seed_default_users(db)

        acc_count = db.query(Accident).count()
        if acc_count == 0:
            print("[GeoSafe Startup] Ingesting Excel dataset into SQLite...")
            load_accidents_from_excel(db)

        hs_count = db.query(Hotspot).count()
        if hs_count == 0:
            print("[GeoSafe Startup] Running DBSCAN spatial hotspot clustering...")
            run_dbscan_hotspot_detection(db)

        model_path = os.path.join(settings.MODEL_DIR, "risk_rf_clf.pkl")
        if not os.path.exists(model_path):
            print("[GeoSafe Startup] Training Random Forest risk models...")
            train_and_save_models(db)

        print("[GeoSafe Startup] Database and AI engines ready!")
    except Exception as e:
        print(f"[GeoSafe Startup Warning] {e}")
    finally:
        db.close()

@app.get("/api/health")
def health_check(db: Session = Depends(get_db)):
    db_status = "connected"
    try:
        db.query(User).first()
    except Exception:
        db_status = "error"

    model_status = "available" if os.path.exists(os.path.join(settings.MODEL_DIR, "risk_rf_clf.pkl")) else "not_trained"

    return {
        "status": "ok",
        "database": db_status,
        "model": model_status,
        "version": settings.PROJECT_VERSION
    }

@app.get("/")
def root():
    return {
        "message": "Welcome to GeoSafe API",
        "docs_url": "/docs",
        "health_check": "/api/health"
    }
