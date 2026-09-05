import pandas as pd
import numpy as np
from sklearn.cluster import DBSCAN
from sqlalchemy.orm import Session
from backend.models import Accident, Hotspot, SystemLog
from backend.services.preprocessing import SEVERITY_WEIGHT_MAP

def run_dbscan_hotspot_detection(db: Session, eps_km: float = 0.8, min_samples: int = 5) -> int:
    accidents = db.query(Accident).all()
    if not accidents:
        return 0

    df = pd.DataFrame([{
        'id': a.accident_id,
        'lat': a.latitude,
        'lon': a.longitude,
        'severity': a.accident_severity,
        'fatalities': a.fatalities,
        'injuries': a.injuries,
        'weather': a.weather,
        'time': a.time,
        'traffic': a.traffic_level,
        'construction': a.construction,
        'road_name': a.road_name,
        'area': a.area,
        'risk_score': a.risk_score
    } for a in accidents])

    # Convert Lat/Lon to Radians for Haversine DBSCAN (Earth radius ~ 6371 km)
    coords_rad = np.radians(df[['lat', 'lon']].to_numpy())
    kms_per_radian = 6371.0
    epsilon = eps_km / kms_per_radian

    dbscan = DBSCAN(eps=epsilon, min_samples=min_samples, metric='haversine')
    df['cluster'] = dbscan.fit_predict(coords_rad)

    # Clear previous hotspots
    db.query(Hotspot).delete()

    unique_clusters = [c for c in df['cluster'].unique() if c != -1]
    hotspots_to_insert = []

    for cluster_id in unique_clusters:
        cdf = df[df['cluster'] == cluster_id]
        acc_count = len(cdf)
        
        centroid_lat = float(cdf['lat'].mean())
        centroid_lon = float(cdf['lon'].mean())

        # Severity Score
        weights = cdf['severity'].map(SEVERITY_WEIGHT_MAP).fillna(1.5)
        avg_severity_score = float(weights.mean())

        # Casualty weight
        fatalities = int(cdf['fatalities'].sum())
        injuries = int(cdf['injuries'].sum())
        casualty_factor = min(100.0, (fatalities * 15.0 + injuries * 5.0) / max(acc_count, 1) * 20.0)

        # Traffic & Construction exposure
        heavy_traffic_pct = (cdf['traffic'].isin(['High', 'Heavy', 'Congested']).sum() / acc_count) * 100.0
        const_pct = ((cdf['construction'] == 'Yes').sum() / acc_count) * 100.0
        exposure_factor = (heavy_traffic_pct * 0.6) + (const_pct * 0.4)

        # Density factor
        density_factor = min(100.0, (acc_count / 15.0) * 100.0)

        # Unified Hotspot Score formula (0-100)
        hotspot_score = round(min(100.0, (
            0.35 * density_factor +
            0.30 * (avg_severity_score / 5.0 * 100.0) +
            0.15 * casualty_factor +
            0.10 * exposure_factor +
            0.10 * (float(cdf['risk_score'].mean()))
        )), 1)

        # Risk level classification
        if hotspot_score >= 80:
            risk_level = "CRITICAL"
        elif hotspot_score >= 60:
            risk_level = "HIGH"
        elif hotspot_score >= 40:
            risk_level = "MEDIUM"
        else:
            risk_level = "LOW"

        # Dominant metadata
        dominant_time = cdf['time'].mode()[0] if not cdf['time'].empty else "18:00"
        dominant_weather = cdf['weather'].mode()[0] if not cdf['weather'].empty else "Clear"
        road_name = cdf['road_name'].mode()[0] if not cdf['road_name'].empty else "Main Road"
        area_name = cdf['area'].mode()[0] if not cdf['area'].empty else "Chennai"

        # Initial status
        status = "Persistent" if acc_count > 25 else ("Emerging" if acc_count < 10 else "Worsening")

        hotspot = Hotspot(
            cluster_id=int(cluster_id),
            latitude=centroid_lat,
            longitude=centroid_lon,
            accident_count=acc_count,
            severity_score=round(avg_severity_score, 2),
            hotspot_score=hotspot_score,
            risk_level=risk_level,
            status=status,
            dominant_time=dominant_time,
            dominant_weather=dominant_weather,
            area_name=area_name,
            road_name=road_name
        )
        hotspots_to_insert.append(hotspot)

    db.bulk_save_objects(hotspots_to_insert)
    db.commit()

    log = SystemLog(
        event=f"DBSCAN executed: detected {len(hotspots_to_insert)} accident hotspots from {len(accidents)} records.",
        user="System"
    )
    db.add(log)
    db.commit()

    return len(hotspots_to_insert)
