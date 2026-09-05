import json
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func, or_

from backend.database import get_db
from backend.models import Accident, RiskPrediction
from backend.schemas import RiskPredictionRequest, RiskPredictionResponse
from backend.ml.predict import predict_risk_from_dict
from backend.services.explainability import generate_risk_explanation

router = APIRouter(prefix="/api/risk", tags=["Risk Intelligence"])

@router.post("/predict", response_model=RiskPredictionResponse)
def predict_spatial_risk(req: RiskPredictionRequest, db: Session = Depends(get_db)):
    data = req.dict()

    resolved_road = req.road_name or ""
    resolved_area = req.area or ""
    lat = req.latitude
    lon = req.longitude

    # 1. Location Resolution Logic
    if resolved_road or resolved_area:
        query = db.query(
            func.avg(Accident.latitude),
            func.avg(Accident.longitude),
            Accident.road_name,
            Accident.area,
            Accident.road_type,
            Accident.speed_limit
        )

        if resolved_road and resolved_area:
            match = query.filter(
                or_(
                    Accident.road_name.ilike(f"%{resolved_road}%"),
                    Accident.area.ilike(f"%{resolved_area}%")
                )
            ).group_by(Accident.road_name).first()
        elif resolved_road:
            match = query.filter(Accident.road_name.ilike(f"%{resolved_road}%")).group_by(Accident.road_name).first()
        else:
            match = query.filter(Accident.area.ilike(f"%{resolved_area}%")).group_by(Accident.area).first()

        if not match:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Location not found in GeoSafe dataset. Please select a location from the suggestions."
            )

        lat = round(float(match[0]), 6)
        lon = round(float(match[1]), 6)
        resolved_road = match[2]
        resolved_area = match[3]

        # Use dataset road attributes if not explicitly overridden by user
        data['road_type'] = req.road_type or match[4]
        data['speed_limit'] = req.speed_limit or match[5]
    elif lat is None or lon is None:
        # Fallback if no location name or lat/lon provided
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Location not found in GeoSafe dataset. Please select a location from the suggestions."
        )

    data['latitude'] = lat
    data['longitude'] = lon
    data['road_name'] = resolved_road
    data['area'] = resolved_area

    # 2. Run Machine Learning Model Prediction
    score, label, conf, contribs = predict_risk_from_dict(data)

    # 3. Generate Dynamic XAI Explanation
    explanation_res = generate_risk_explanation(data, score, label, conf, contribs)

    location_str = f"{resolved_road} ({resolved_area})" if resolved_road and resolved_area else (resolved_road or resolved_area or "Chennai Location")

    # Persist prediction in DB
    try:
        pred_record = RiskPrediction(
            latitude=lat,
            longitude=lon,
            time_period=req.time,
            risk_score=score,
            risk_level=label,
            confidence=conf,
            explanation=json.dumps(explanation_res["explanations"])
        )
        db.add(pred_record)
        db.commit()
    except Exception:
        pass

    return RiskPredictionResponse(
        risk_score=score,
        risk_level=label,
        confidence=conf,
        resolved_location=location_str,
        latitude=lat,
        longitude=lon,
        explanations=explanation_res["explanations"],
        why_risky=explanation_res["why_risky"],
        reduction_suggestions=explanation_res["reduction_suggestions"]
    )

@router.get("/areas")
def get_spatial_risk_grid(db: Session = Depends(get_db)):
    lats = [12.92, 12.98, 13.04, 13.10, 13.15]
    lons = [80.12, 80.18, 80.22, 80.26, 80.28]

    grid_results = []
    for lat in lats:
        for lon in lons:
            sample_data = {
                "latitude": lat,
                "longitude": lon,
                "time": "18:30",
                "weather": "Clear",
                "traffic_level": "High",
                "road_type": "Arterial",
                "speed_limit": 60,
                "construction": "No"
            }
            score, label, conf, _ = predict_risk_from_dict(sample_data)
            grid_results.append({
                "latitude": lat,
                "longitude": lon,
                "risk_score": score,
                "risk_level": label
            })

    return grid_results
