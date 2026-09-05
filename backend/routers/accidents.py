import os
import json
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_, func

from backend.database import get_db
from backend.models import Accident, SystemLog
from backend.schemas import AccidentResponse, AccidentBase, DatasetMetadataResponse, LocationItem
from backend.utils.data_loader import load_accidents_from_excel
from backend.services.hotspot_detection import run_dbscan_hotspot_detection
from backend.ml.train import train_and_save_models

router = APIRouter(prefix="/api/accidents", tags=["Accidents"])

# Load offline Chennai road graph nodes for location search
ROAD_GRAPH_NODES = {}
GRAPH_FILE_PATH = "data/chennai_road_network/chennai_road_graph.json"
if os.path.exists(GRAPH_FILE_PATH):
    try:
        with open(GRAPH_FILE_PATH, "r") as f:
            data = json.load(f)
            ROAD_GRAPH_NODES = data.get("nodes", {})
    except Exception:
        pass

@router.get("/meta", response_model=DatasetMetadataResponse)
def get_accidents_metadata(db: Session = Depends(get_db)):
    severities = [r[0] for r in db.query(Accident.accident_severity).distinct().all() if r[0]]
    weather_conditions = [r[0] for r in db.query(Accident.weather).distinct().all() if r[0]]
    traffic_levels = [r[0] for r in db.query(Accident.traffic_level).distinct().all() if r[0]]
    construction_options = [r[0] for r in db.query(Accident.construction).distinct().all() if r[0]]
    areas = [r[0] for r in db.query(Accident.area).distinct().order_by(Accident.area).all() if r[0]]
    roads = [r[0] for r in db.query(Accident.road_name).distinct().order_by(Accident.road_name).all() if r[0]]

    return DatasetMetadataResponse(
        severities=sorted(severities),
        weather_conditions=sorted(weather_conditions),
        traffic_levels=sorted(traffic_levels),
        construction_options=sorted(construction_options),
        areas=areas,
        roads=roads
    )

@router.get("/locations", response_model=List[LocationItem])
def search_location_suggestions(
    query: str = Query("", min_length=0),
    db: Session = Depends(get_db)
):
    q_str = query.strip().lower()
    results = []
    seen_names = set()

    # 1. Search Road Graph Nodes
    for node_id, attrs in ROAD_GRAPH_NODES.items():
        name = attrs["name"]
        area = attrs["area"]
        if not q_str or q_str in name.lower() or q_str in area.lower():
            if name not in seen_names:
                results.append(LocationItem(
                    name=name,
                    type="road_network",
                    area=area,
                    latitude=attrs["lat"],
                    longitude=attrs["lon"]
                ))
                seen_names.add(name)

    # 2. Search Database Accident Records
    if q_str:
        q_pattern = f"%{q_str}%"
        road_matches = db.query(
            Accident.road_name,
            Accident.area,
            func.avg(Accident.latitude),
            func.avg(Accident.longitude)
        ).filter(Accident.road_name.ilike(q_pattern)).group_by(Accident.road_name).limit(10).all()

        for r in road_matches:
            if r[0] not in seen_names:
                results.append(LocationItem(
                    name=r[0],
                    type="road",
                    area=r[1],
                    latitude=round(float(r[2]), 6),
                    longitude=round(float(r[3]), 6)
                ))
                seen_names.add(r[0])

        area_matches = db.query(
            Accident.area,
            func.avg(Accident.latitude),
            func.avg(Accident.longitude)
        ).filter(Accident.area.ilike(q_pattern)).group_by(Accident.area).limit(5).all()

        for a in area_matches:
            if a[0] not in seen_names:
                results.append(LocationItem(
                    name=a[0],
                    type="area",
                    area=a[0],
                    latitude=round(float(a[1]), 6),
                    longitude=round(float(a[2]), 6)
                ))
                seen_names.add(a[0])

    return results[:20]

@router.get("", response_model=dict)
def get_accidents(
    db: Session = Depends(get_db),
    page: int = Query(1, ge=1),
    limit: int = Query(100, ge=1, le=10000),
    search: Optional[str] = None,
    area: Optional[str] = None,
    road_name: Optional[str] = None,
    severity: Optional[str] = None,
    weather: Optional[str] = None,
    traffic: Optional[str] = None,
    risk_label: Optional[str] = None,
    construction: Optional[str] = None
):
    query = db.query(Accident)

    if search:
        s = f"%{search}%"
        query = query.filter(
            or_(
                Accident.accident_id.like(s),
                Accident.road_name.like(s),
                Accident.area.like(s)
            )
        )
    if area and area.strip() and area.lower() not in ['all', 'all chennai areas']:
        query = query.filter(Accident.area == area.strip())
    if road_name and road_name.strip():
        query = query.filter(Accident.road_name == road_name.strip())
    if severity and severity.strip() and severity.lower() not in ['all', 'all severities']:
        query = query.filter(Accident.accident_severity == severity.strip())
    if weather and weather.strip() and weather.lower() not in ['all', 'all weather']:
        query = query.filter(Accident.weather == weather.strip())
    if traffic and traffic.strip() and traffic.lower() not in ['all', 'all traffic levels']:
        query = query.filter(Accident.traffic_level == traffic.strip())
    if risk_label and risk_label.strip():
        query = query.filter(Accident.risk_label == risk_label.strip())
    if construction and construction.strip() and construction.lower() not in ['all', 'all locations']:
        const_val = "Yes" if construction.strip().lower() in ['yes', 'construction'] else "No"
        query = query.filter(Accident.construction == const_val)

    total = query.count()
    items = query.offset((page - 1) * limit).limit(limit).all()

    return {
        "total": total,
        "page": page,
        "limit": limit,
        "accidents": [AccidentResponse.from_orm(a) for a in items]
    }

@router.get("/{accident_id}", response_model=AccidentResponse)
def get_accident_by_id(accident_id: str, db: Session = Depends(get_db)):
    acc = db.query(Accident).filter(Accident.accident_id == accident_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Accident not found")
    return AccidentResponse.from_orm(acc)

@router.post("", response_model=AccidentResponse)
def create_accident(acc_in: AccidentBase, db: Session = Depends(get_db)):
    acc = Accident(**acc_in.dict())
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return AccidentResponse.from_orm(acc)

@router.post("/upload")
async def upload_accidents_excel(file: UploadFile = File(...), db: Session = Depends(get_db)):
    if not file.filename.endswith(('.xlsx', '.xls')):
        raise HTTPException(status_code=400, detail="Only Excel files (.xlsx, .xls) are allowed")

    upload_dir = "data"
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, "uploaded_dataset.xlsx")

    with open(file_path, "wb") as f:
        content = await file.read()
        f.write(content)

    count = load_accidents_from_excel(db, file_path)
    run_dbscan_hotspot_detection(db)
    train_and_save_models(db)

    return {
        "message": f"Successfully processed Excel dataset and ingested {count} accident records.",
        "records": count
    }

@router.delete("/{accident_id}")
def delete_accident(accident_id: str, db: Session = Depends(get_db)):
    acc = db.query(Accident).filter(Accident.accident_id == accident_id).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Accident not found")
    db.delete(acc)
    db.commit()
    return {"message": f"Accident {accident_id} deleted successfully"}
