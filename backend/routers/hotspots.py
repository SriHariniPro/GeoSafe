from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Hotspot
from backend.schemas import HotspotResponse
from backend.services.hotspot_detection import run_dbscan_hotspot_detection
from backend.services.forecasting import analyze_hotspot_evolution

router = APIRouter(prefix="/api/hotspots", tags=["Hotspots"])

@router.get("", response_model=List[HotspotResponse])
def get_hotspots(db: Session = Depends(get_db)):
    hotspots = db.query(Hotspot).order_by(Hotspot.hotspot_score.desc()).all()
    # If database has no hotspots yet, auto-run detection
    if not hotspots:
        run_dbscan_hotspot_detection(db)
        hotspots = db.query(Hotspot).order_by(Hotspot.hotspot_score.desc()).all()
    return [HotspotResponse.from_orm(h) for h in hotspots]

@router.get("/evolution")
def get_hotspot_evolution(db: Session = Depends(get_db)):
    return analyze_hotspot_evolution(db)

@router.get("/{id}", response_model=HotspotResponse)
def get_hotspot_by_id(id: int, db: Session = Depends(get_db)):
    hs = db.query(Hotspot).filter(Hotspot.id == id).first()
    if not hs:
        raise HTTPException(status_code=404, detail="Hotspot not found")
    return HotspotResponse.from_orm(hs)

@router.post("/detect")
def trigger_hotspot_detection(
    eps_km: float = Query(0.8, ge=0.1, le=5.0),
    min_samples: int = Query(5, ge=2, le=50),
    db: Session = Depends(get_db)
):
    count = run_dbscan_hotspot_detection(db, eps_km, min_samples)
    return {
        "message": f"DBSCAN hotspot detection completed successfully.",
        "detected_hotspots": count
    }
