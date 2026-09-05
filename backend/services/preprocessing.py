import pandas as pd
import numpy as np
from typing import Dict, Any, Tuple

# Mappings for categorical variables
WEATHER_MAP = {'Clear': 1, 'Cloudy': 2, 'Fog/Mist': 3, 'Rain': 4, 'Heavy Rain': 5}
TRAFFIC_MAP = {'Low': 1, 'Medium': 2, 'High': 3, 'Heavy': 4, 'Congested': 5}
ROAD_TYPE_MAP = {'Local': 1, 'Collector': 2, 'Arterial': 3, 'Expressway/Highway': 4}
DAY_MAP = {'Monday': 1, 'Tuesday': 2, 'Wednesday': 3, 'Thursday': 4, 'Friday': 5, 'Saturday': 6, 'Sunday': 7}
SEVERITY_WEIGHT_MAP = {'Minor': 1.0, 'Moderate': 2.0, 'Severe': 3.5, 'Fatal': 5.0}

FEATURE_COLUMNS = [
    'latitude', 'longitude', 'hour', 'is_weekend', 'is_night', 'is_peak_hour',
    'weather_code', 'traffic_code', 'road_type_code', 'speed_limit',
    'construction_code', 'visibility', 'temperature', 'traffic_severity_index',
    'weather_risk_index'
]

def parse_hour_from_time(time_str: str) -> int:
    try:
        if isinstance(time_str, str) and ':' in time_str:
            parts = time_str.split(':')
            return int(parts[0])
        return 12
    except Exception:
        return 12

def engineer_features(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()

    # Normalize column names for internal processing
    df['hour'] = df['Time'].apply(parse_hour_from_time) if 'Time' in df.columns else df['time'].apply(parse_hour_from_time)
    
    day_col = df['Day_of_Week'] if 'Day_of_Week' in df.columns else df['day_of_week']
    df['is_weekend'] = day_col.isin(['Saturday', 'Sunday']).astype(int)
    df['is_night'] = df['hour'].apply(lambda h: 1 if h >= 20 or h <= 5 else 0)
    df['is_peak_hour'] = df['hour'].apply(lambda h: 1 if (8 <= h <= 10) or (17 <= h <= 20) else 0)

    weather_col = df['Weather'] if 'Weather' in df.columns else df['weather']
    df['weather_code'] = weather_col.map(WEATHER_MAP).fillna(1).astype(int)

    traffic_col = df['Traffic_Level'] if 'Traffic_Level' in df.columns else df['traffic_level']
    df['traffic_code'] = traffic_col.map(TRAFFIC_MAP).fillna(2).astype(int)

    road_col = df['Road_Type'] if 'Road_Type' in df.columns else df['road_type']
    df['road_type_code'] = road_col.map(ROAD_TYPE_MAP).fillna(2).astype(int)

    const_col = df['Construction'] if 'Construction' in df.columns else df['construction']
    df['construction_code'] = const_col.apply(lambda c: 1 if str(c).lower() in ['yes', '1', 'true'] else 0)

    vis_col = df['Visibility_km'] if 'Visibility_km' in df.columns else (df['visibility'] if 'visibility' in df.columns else pd.Series(5.0, index=df.index))
    df['visibility'] = vis_col.fillna(5.0)

    temp_col = df['Temperature_C'] if 'Temperature_C' in df.columns else (df['temperature'] if 'temperature' in df.columns else pd.Series(30.0, index=df.index))
    df['temperature'] = temp_col.fillna(30.0)

    speed_col = df['Speed_Limit_kmph'] if 'Speed_Limit_kmph' in df.columns else (df['speed_limit'] if 'speed_limit' in df.columns else pd.Series(50, index=df.index))
    df['speed_limit'] = speed_col.fillna(50)

    df['latitude'] = df['Latitude'] if 'Latitude' in df.columns else df['latitude']
    df['longitude'] = df['Longitude'] if 'Longitude' in df.columns else df['longitude']

    # Derived combined risk indices
    df['traffic_severity_index'] = df['traffic_code'] * (df['speed_limit'] / 50.0)
    df['weather_risk_index'] = df['weather_code'] * (5.0 / np.maximum(df['visibility'], 0.5))

    return df

def extract_feature_vector_from_dict(data: Dict[str, Any]) -> Tuple[np.ndarray, Dict[str, float]]:
    hour = parse_hour_from_time(data.get('time', '12:00'))
    day = data.get('day_of_week', 'Friday')
    is_weekend = 1 if day in ['Saturday', 'Sunday'] else 0
    is_night = 1 if hour >= 20 or hour <= 5 else 0
    is_peak = 1 if (8 <= hour <= 10) or (17 <= hour <= 20) else 0

    w_code = WEATHER_MAP.get(data.get('weather', 'Clear'), 1)
    t_code = TRAFFIC_MAP.get(data.get('traffic_level', 'Medium'), 2)
    r_code = ROAD_TYPE_MAP.get(data.get('road_type', 'Arterial'), 3)
    c_code = 1 if str(data.get('construction', 'No')).lower() in ['yes', '1', 'true'] else 0
    vis = float(data.get('visibility', 5.0))
    temp = float(data.get('temperature', 30.0))
    speed = float(data.get('speed_limit', 60))
    lat = float(data.get('latitude', 13.04))
    lon = float(data.get('longitude', 80.23))

    traffic_sev_index = t_code * (speed / 50.0)
    weather_risk_index = w_code * (5.0 / max(vis, 0.5))

    feat_dict = {
        'latitude': lat,
        'longitude': lon,
        'hour': hour,
        'is_weekend': is_weekend,
        'is_night': is_night,
        'is_peak_hour': is_peak,
        'weather_code': w_code,
        'traffic_code': t_code,
        'road_type_code': r_code,
        'speed_limit': speed,
        'construction_code': c_code,
        'visibility': vis,
        'temperature': temp,
        'traffic_severity_index': traffic_sev_index,
        'weather_risk_index': weather_risk_index
    }

    vector = np.array([[feat_dict[col] for col in FEATURE_COLUMNS]])
    return vector, feat_dict
