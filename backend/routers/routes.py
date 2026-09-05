from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from backend.database import get_db
from backend.schemas import RouteRequest, RouteResponse
from backend.services.route_engine import analyze_safety_routes

router = APIRouter(prefix="/api/routes", tags=["Safety Routing"])

@router.post("/analyze", response_model=RouteResponse)
def calculate_safety_routes(req: RouteRequest, db: Session = Depends(get_db)):
    res = analyze_safety_routes(db, req.origin, req.destination)
    return RouteResponse(**res)
