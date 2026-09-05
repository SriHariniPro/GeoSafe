import os
import sys

# Ensure backend modules are importable from project root
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.config import settings
from backend.database import Base, engine, SessionLocal
from backend.models import Accident, Hotspot
from backend.utils.data_loader import seed_default_users, load_accidents_from_excel
from backend.services.hotspot_detection import run_dbscan_hotspot_detection
from backend.ml.train import train_and_save_models

def run_setup():
    print("==================================================")
    print(" GeoSafe Automatic System Setup & Data Pipeline")
    print("==================================================")

    # 1. Create Directories
    print("\n[Step 1/5] Creating required data & model directories...")
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)
    print("✓ Directories verified.")

    # 2. Initialize Database
    print("\n[Step 2/5] Initializing SQLite database schema...")
    Base.metadata.create_all(bind=engine)
    print("✓ Database tables created in geosafe.db")

    # 3. Seed Users & Dataset Ingestion
    print("\n[Step 3/5] Ingesting primary accident dataset...")
    db = SessionLocal()
    try:
        seed_default_users(db)
        acc_count = load_accidents_from_excel(db)
        print(f"✓ Ingested {acc_count} accident records from Excel dataset.")
    except Exception as e:
        print(f"❌ Error during dataset ingestion: {e}")
        db.close()
        sys.exit(1)

    # 4. Run DBSCAN Hotspot Clustering
    print("\n[Step 4/5] Executing DBSCAN Spatial Hotspot Clustering...")
    try:
        hs_count = run_dbscan_hotspot_detection(db)
        print(f"✓ Detected {hs_count} spatial accident hotspots.")
    except Exception as e:
        print(f"❌ Error during DBSCAN clustering: {e}")

    # 5. Train Random Forest Risk Model
    print("\n[Step 5/5] Training Random Forest Risk Classifier & Regressor...")
    try:
        metrics = train_and_save_models(db)
        print(f"✓ Model trained with Accuracy: {metrics['accuracy']*100:.1f}%, F1: {metrics['f1_score']*100:.1f}%, R²: {metrics['r2_score']:.2f}")
    except Exception as e:
        print(f"❌ Error during ML training: {e}")
    finally:
        db.close()

    print("\n==================================================")
    print(" GeoSafe Setup Complete! All engines are ready.")
    print(" Start backend:  uvicorn backend.main:app --reload")
    print(" Start frontend: cd frontend && npm run dev")
    print("==================================================")

if __name__ == "__main__":
    run_setup()
