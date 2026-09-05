import pandas as pd
from typing import Dict, Any, List
from sqlalchemy.orm import Session
from backend.models import Accident

def get_eda_analytics(db: Session) -> Dict[str, Any]:
    accidents = db.query(Accident).all()
    if not accidents:
        return {
            "accidents_by_month": {},
            "accidents_by_hour": {},
            "accidents_by_day": {},
            "severity_distribution": {},
            "weather_distribution": {},
            "traffic_distribution": {},
            "road_type_distribution": {},
            "construction_distribution": {},
            "traffic_vs_severity": [],
            "weather_vs_severity": [],
            "observations": ["No accident data available in database."]
        }

    df = pd.DataFrame([{
        'id': a.accident_id,
        'date': a.date,
        'time': a.time,
        'day': a.day_of_week,
        'weather': a.weather,
        'traffic': a.traffic_level,
        'road_type': a.road_type,
        'severity': a.accident_severity,
        'construction': a.construction,
        'fatalities': a.fatalities,
        'injuries': a.injuries,
        'risk_score': a.risk_score
    } for a in accidents])

    # Extract month & hour
    df['month'] = df['date'].apply(lambda d: d.split('-')[1] if isinstance(d, str) and '-' in d and len(d.split('-')) > 1 else '01')
    df['hour'] = df['time'].apply(lambda t: t.split(':')[0] if isinstance(t, str) and ':' in t else '12')

    month_order = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12']
    month_names = {'01':'Jan', '02':'Feb', '03':'Mar', '04':'Apr', '05':'May', '06':'Jun', '07':'Jul', '08':'Aug', '09':'Sep', '10':'Oct', '11':'Nov', '12':'Dec'}
    
    accidents_by_month = {month_names[m]: int((df['month'] == m).sum()) for m in month_order}
    accidents_by_hour = {f"{int(h):02d}:00": int((df['hour'] == str(h)).sum()) for h in range(24)}
    
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    accidents_by_day = {d: int((df['day'] == d).sum()) for d in days}

    severity_dist = df['severity'].value_counts().to_dict()
    weather_dist = df['weather'].value_counts().to_dict()
    traffic_dist = df['traffic'].value_counts().to_dict()
    road_type_dist = df['road_type'].value_counts().to_dict()
    construction_dist = df['construction'].value_counts().to_dict()

    # Cross-tabulations: Traffic vs Severity
    t_vs_s = pd.crosstab(df['traffic'], df['severity']).reset_index().to_dict(orient='records')
    w_vs_s = pd.crosstab(df['weather'], df['severity']).reset_index().to_dict(orient='records')

    # Automatically generate observations
    obs = []
    top_hour = max(accidents_by_hour.items(), key=lambda x: x[1])[0]
    obs.append(f"Peak accident concentration is observed around {top_hour}, corresponding to evening rush-hour traffic.")

    top_day = max(accidents_by_day.items(), key=lambda x: x[1])[0]
    obs.append(f"{top_day} registered the highest cumulative accident count among weekdays.")

    fatal_pct = round((df['severity'] == 'Fatal').sum() / len(df) * 100.0, 1)
    obs.append(f"Fatal accidents constitute {fatal_pct}% of total recorded incidents.")

    const_count = (df['construction'] == 'Yes').sum()
    obs.append(f"Active construction zones were associated with {const_count} accidents ({round(const_count/len(df)*100.0, 1)}% of total).")

    return {
        "accidents_by_month": accidents_by_month,
        "accidents_by_hour": accidents_by_hour,
        "accidents_by_day": accidents_by_day,
        "severity_distribution": severity_dist,
        "weather_distribution": weather_dist,
        "traffic_distribution": traffic_dist,
        "road_type_distribution": road_type_dist,
        "construction_distribution": construction_dist,
        "traffic_vs_severity": t_vs_s,
        "weather_vs_severity": w_vs_s,
        "observations": obs
    }
