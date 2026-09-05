from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from backend.database import get_db
from backend.models import Intervention, ConstructionSite
from backend.schemas import InterventionResponse, InterventionUpdate, ConstructionResponse
from backend.services.intervention_engine import generate_authority_interventions

router = APIRouter(prefix="/api", tags=["Authority Interventions & Construction"])

@router.get("/construction", response_model=List[ConstructionResponse])
def get_construction_sites(db: Session = Depends(get_db)):
    sites = db.query(ConstructionSite).all()
    return [ConstructionResponse.from_orm(s) for s in sites]

@router.get("/interventions", response_model=List[InterventionResponse])
def get_interventions(db: Session = Depends(get_db)):
    items = db.query(Intervention).order_by(Intervention.priority).all()
    if not items:
        generate_authority_interventions(db)
        items = db.query(Intervention).all()
    return [InterventionResponse.from_orm(i) for i in items]

@router.post("/interventions/generate", response_model=List[InterventionResponse])
def generate_interventions(db: Session = Depends(get_db)):
    res = generate_authority_interventions(db)
    return res

@router.put("/interventions/{intervention_id}", response_model=InterventionResponse)
def update_intervention(
    intervention_id: int,
    itv_in: InterventionUpdate,
    db: Session = Depends(get_db)
):
    itv = db.query(Intervention).filter(Intervention.id == intervention_id).first()
    if not itv:
        raise HTTPException(status_code=404, detail="Intervention record not found")

    update_data = itv_in.dict(exclude_unset=True)
    for field, val in update_data.items():
        if val is not None:
            setattr(itv, field, val)

    db.commit()
    db.refresh(itv)
    return InterventionResponse.from_orm(itv)
