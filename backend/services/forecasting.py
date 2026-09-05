import pandas as pd
from typing import List, Dict, Any
from sqlalchemy.orm import Session
from backend.models import Accident, Hotspot

def analyze_hotspot_evolution(db: Session, period_filter: str = "Quarterly") -> List[Dict[str, Any]]:
    hotspots = db.query(Hotspot).all()
    accidents = db.query(Accident).all()
    
    if not hotspots or not accidents:
        return []

    df_acc = pd.DataFrame([{
        'lat': a.latitude,
        'lon': a.longitude,
        'date': a.date,
        'year': int(a.date.split('-')[0]) if isinstance(a.date, str) and '-' in a.date else 2025,
        'month': int(a.date.split('-')[1]) if isinstance(a.date, str) and '-' in a.date and len(a.date.split('-')) > 1 else 6
    } for a in accidents])

    # Assign period (H1 vs H2 or 2024 vs 2025)
    df_acc['period'] = df_acc.apply(lambda r: f"Y{r['year']}-P{1 if r['month'] <= 6 else 2}", axis=1)

    evolution_results = []
    periods = sorted(df_acc['period'].unique())
    p_curr = periods[-1] if len(periods) > 0 else "Y2025-P2"
    p_prev = periods[-2] if len(periods) > 1 else p_curr

    for hs in hotspots:
        # Distance calculation to centroid
        dist = ((df_acc['lat'] - hs.latitude)**2 + (df_acc['lon'] - hs.longitude)**2)**0.5
        near_acc = df_acc[dist <= 0.015]  # ~1.5km radius

        cnt_prev = len(near_acc[near_acc['period'] == p_prev])
        cnt_curr = len(near_acc[near_acc['period'] == p_curr])

        if cnt_prev == 0 and cnt_curr > 0:
            status = "EMERGING"
        elif cnt_curr > cnt_prev * 1.25:
            status = "WORSENING"
        elif cnt_curr < cnt_prev * 0.75:
            status = "IMPROVING"
        elif cnt_curr == 0 and cnt_prev > 0:
            status = "DISAPPEARING"
        else:
            status = "PERSISTENT"

        evolution_results.append({
            "hotspot_id": hs.id,
            "cluster_id": hs.cluster_id,
            "road_name": hs.road_name or "Chennai Corridor",
            "area_name": hs.area_name or "Chennai",
            "previous_count": cnt_prev,
            "current_count": cnt_curr,
            "change_pct": round(((cnt_curr - cnt_prev) / max(cnt_prev, 1)) * 100.0, 1),
            "status": status,
            "hotspot_score": hs.hotspot_score,
            "latitude": hs.latitude,
            "longitude": hs.longitude
        })

    return evolution_results
