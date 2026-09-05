import pandas as pd
from typing import Dict, Any, List

REQUIRED_COLUMNS = [
    'Accident_ID', 'Latitude', 'Longitude', 'Road_Name', 'Area', 
    'Date', 'Time', 'Day_of_Week', 'Weather', 'Traffic_Level', 
    'Road_Type', 'Speed_Limit_kmph', 'Construction', 'Accident_Severity', 
    'Vehicles_Involved', 'Fatalities', 'Injuries', 'Risk_Score', 'Risk_Label'
]

def validate_dataset(df: pd.DataFrame) -> Dict[str, Any]:
    missing_cols = [c for c in REQUIRED_COLUMNS if c not in df.columns]
    
    total_rows = len(df)
    total_cols = len(df.columns)
    missing_values = int(df.isna().sum().sum())
    duplicates = int(df.duplicated(subset=['Accident_ID']).sum()) if 'Accident_ID' in df.columns else int(df.duplicated().sum())
    
    # Coordinate validation for Chennai region
    invalid_coords = 0
    if 'Latitude' in df.columns and 'Longitude' in df.columns:
        invalid_mask = (
            (df['Latitude'] < 12.0) | (df['Latitude'] > 14.0) | 
            (df['Longitude'] < 79.0) | (df['Longitude'] > 81.0)
        )
        invalid_coords = int(invalid_mask.sum())

    unique_roads = int(df['Road_Name'].nunique()) if 'Road_Name' in df.columns else 0
    unique_areas = int(df['Area'].nunique()) if 'Area' in df.columns else 0
    
    date_min = str(df['Date'].min()) if 'Date' in df.columns else "N/A"
    date_max = str(df['Date'].max()) if 'Date' in df.columns else "N/A"

    return {
        "valid": len(missing_cols) == 0,
        "missing_columns": missing_cols,
        "total_rows": total_rows,
        "total_columns": total_cols,
        "missing_values": missing_values,
        "duplicate_rows": duplicates,
        "invalid_coordinates": invalid_coords,
        "unique_roads": unique_roads,
        "unique_areas": unique_areas,
        "date_range": f"{date_min} to {date_max}"
    }
