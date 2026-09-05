import os
import pandas as pd
from sqlalchemy.orm import Session
from passlib.context import CryptContext
from backend.config import settings
from backend.models import User, Accident, ConstructionSite, SystemLog
from backend.utils.validators import validate_dataset

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def hash_password(password: str) -> str:
    return pwd_context.hash(password[:72])

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def seed_default_users(db: Session):
    existing_admin = db.query(User).filter(User.email == "admin@geosafe.local").first()
    if not existing_admin:
        admin_user = User(
            name="Authority Admin",
            email="admin@geosafe.local",
            password_hash=hash_password("admin123"),
            role="admin"
        )
        db.add(admin_user)

    existing_user = db.query(User).filter(User.email == "user@geosafe.local").first()
    if not existing_user:
        standard_user = User(
            name="Chennai Citizen",
            email="user@geosafe.local",
            password_hash=hash_password("user123"),
            role="user"
        )
        db.add(standard_user)

    db.commit()

def load_accidents_from_excel(db: Session, excel_path: str = None) -> int:
    path = excel_path or settings.DATASET_PATH
    if not os.path.exists(path):
        # Fallback to root dataset path if data/ path not populated
        if os.path.exists("GeoSafe_Chennai_Synthetic_Dataset.xlsx"):
            path = "GeoSafe_Chennai_Synthetic_Dataset.xlsx"
        else:
            raise FileNotFoundError(f"Primary accident dataset not found at {path}. Please place the provided Excel file inside data/")

    df = pd.read_excel(path)
    val_report = validate_dataset(df)
    
    # Standardize column mapping if slight differences exist
    col_map = {
        'Temperature_C': 'temperature',
        'Visibility_km': 'visibility',
        'Speed_Limit_kmph': 'speed_limit'
    }
    df = df.rename(columns=col_map)

    # Clean & fill missing
    df['temperature'] = df['temperature'].fillna(30.0) if 'temperature' in df.columns else 30.0
    df['visibility'] = df['visibility'].fillna(5.0) if 'visibility' in df.columns else 5.0
    df['speed_limit'] = df['speed_limit'].fillna(50) if 'speed_limit' in df.columns else 50
    df['Construction'] = df['Construction'].fillna('No')
    df['Vehicles_Involved'] = df['Vehicles_Involved'].fillna(1).astype(int)
    df['Fatalities'] = df['Fatalities'].fillna(0).astype(int)
    df['Injuries'] = df['Injuries'].fillna(0).astype(int)

    # Truncate existing accidents table to avoid duplicates on re-ingestion
    db.query(Accident).delete()

    accidents_to_insert = []
    for _, row in df.iterrows():
        acc = Accident(
            accident_id=str(row['Accident_ID']),
            latitude=float(row['Latitude']),
            longitude=float(row['Longitude']),
            road_name=str(row['Road_Name']),
            area=str(row['Area']),
            date=str(row['Date']),
            time=str(row['Time']),
            day_of_week=str(row['Day_of_Week']),
            weather=str(row['Weather']),
            temperature=float(row['temperature']),
            visibility=float(row['visibility']),
            traffic_level=str(row['Traffic_Level']),
            road_type=str(row['Road_Type']),
            speed_limit=int(row['speed_limit']),
            construction=str(row['Construction']),
            accident_severity=str(row['Accident_Severity']),
            vehicles_involved=int(row['Vehicles_Involved']),
            fatalities=int(row['Fatalities']),
            injuries=int(row['Injuries']),
            risk_score=float(row['Risk_Score']),
            risk_label=str(row['Risk_Label'])
        )
        accidents_to_insert.append(acc)

    db.bulk_save_objects(accidents_to_insert)
    db.commit()

    # Seed construction sites from accident records marked with Construction == 'Yes'
    db.query(ConstructionSite).delete()
    construction_rows = df[df['Construction'] == 'Yes'].drop_duplicates(subset=['Road_Name']).head(15)
    sites_to_insert = []
    for _, r in construction_rows.iterrows():
        site = ConstructionSite(
            latitude=float(r['Latitude']),
            longitude=float(r['Longitude']),
            road_name=str(r['Road_Name']),
            construction_type="Road Widening & Resurfacing",
            severity="High" if r['Accident_Severity'] in ['Fatal', 'Severe'] else "Medium",
            start_date="2025-01-10",
            end_date="2026-12-31",
            status="Active"
        )
        sites_to_insert.append(site)
    if sites_to_insert:
        db.bulk_save_objects(sites_to_insert)
        db.commit()

    # Log ingestion event
    log = SystemLog(
        event=f"Successfully loaded {len(accidents_to_insert)} accident records from {os.path.basename(path)}",
        user="System"
    )
    db.add(log)
    db.commit()

    return len(accidents_to_insert)
