import pandas as pd
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from backend.database import get_db
from backend.models import Accident, Hotspot
from backend.schemas import DashboardSummaryResponse

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

@router.get("", response_model=DashboardSummaryResponse)
def get_dashboard_summary(db: Session = Depends(get_db)):
    accidents = db.query(Accident).all()
    if not accidents:
        return DashboardSummaryResponse(
            total_accidents=0,
            high_risk_accidents=0,
            detected_hotspots=0,
            total_fatalities=0,
            total_injuries=0,
            average_risk_score=0.0,
            most_dangerous_road="None",
            highest_risk_area="None",
            todays_safety_insight="No accident data imported into GeoSafe system yet."
        )

    df = pd.DataFrame([{
        'road': a.road_name,
        'area': a.area,
        'severity': a.accident_severity,
        'fatalities': a.fatalities,
        'injuries': a.injuries,
        'risk_score': a.risk_score,
        'risk_label': a.risk_label,
        'time': a.time,
        'traffic': a.traffic_level
    } for a in accidents])

    total_accidents = len(df)
    high_risk_accidents = int((df['risk_label'].str.upper().isin(['HIGH', 'CRITICAL'])).sum())
    detected_hotspots = db.query(Hotspot).count()
    total_fatalities = int(df['fatalities'].sum())
    total_injuries = int(df['injuries'].sum())
    average_risk_score = round(float(df['risk_score'].mean()), 1)

    most_dangerous_road = str(df.groupby('road')['fatalities'].sum().idxmax()) if not df.empty else "Anna Salai"
    highest_risk_area = str(df.groupby('area')['risk_score'].mean().idxmax()) if not df.empty else "T. Nagar"

    # Dynamic Insight generation
    peak_traffic_pct = round((df['traffic'].isin(['High', 'Heavy', 'Congested']).sum() / total_accidents) * 100.0, 1)
    
    todays_safety_insight = (
        f"High-risk accident conditions are concentrated around evening peak hours along major arterial corridors. "
        f"Approximately {peak_traffic_pct}% of severe incidents correlate with elevated traffic congestion near {highest_risk_area}."
    )

    return DashboardSummaryResponse(
        total_accidents=total_accidents,
        high_risk_accidents=high_risk_accidents,
        detected_hotspots=detected_hotspots,
        total_fatalities=total_fatalities,
        total_injuries=total_injuries,
        average_risk_score=average_risk_score,
        most_dangerous_road=most_dangerous_road,
        highest_risk_area=highest_risk_area,
        todays_safety_insight=todays_safety_insight
    )
