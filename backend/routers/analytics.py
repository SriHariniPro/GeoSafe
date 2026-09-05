from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import EDASummaryResponse
from backend.services.eda import get_eda_analytics

router = APIRouter(prefix="/api/analytics", tags=["Analytics & EDA"])

@router.get("/eda", response_model=EDASummaryResponse)
def get_eda(db: Session = Depends(get_db)):
    res = get_eda_analytics(db)
    return EDASummaryResponse(**res)
