import os
import json
import joblib
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, r2_score
from sqlalchemy.orm import Session

from backend.config import settings
from backend.models import Accident
from backend.services.preprocessing import engineer_features, FEATURE_COLUMNS

MODEL_DIR = settings.MODEL_DIR

def train_and_save_models(db: Session = None, df_input: pd.DataFrame = None) -> dict:
    os.makedirs(MODEL_DIR, exist_ok=True)

    if df_input is None:
        if db is not None:
            accidents = db.query(Accident).all()
            if accidents:
                df_input = pd.DataFrame([{
                    'Accident_ID': a.accident_id,
                    'Latitude': a.latitude,
                    'Longitude': a.longitude,
                    'Road_Name': a.road_name,
                    'Area': a.area,
                    'Date': a.date,
                    'Time': a.time,
                    'Day_of_Week': a.day_of_week,
                    'Weather': a.weather,
                    'Temperature_C': a.temperature,
                    'Visibility_km': a.visibility,
                    'Traffic_Level': a.traffic_level,
                    'Road_Type': a.road_type,
                    'Speed_Limit_kmph': a.speed_limit,
                    'Construction': a.construction,
                    'Accident_Severity': a.accident_severity,
                    'Vehicles_Involved': a.vehicles_involved,
                    'Fatalities': a.fatalities,
                    'Injuries': a.injuries,
                    'Risk_Score': a.risk_score,
                    'Risk_Label': a.risk_label
                } for a in accidents])
        if df_input is None or len(df_input) == 0:
            if os.path.exists(settings.DATASET_PATH):
                df_input = pd.read_excel(settings.DATASET_PATH)
            elif os.path.exists("GeoSafe_Chennai_Synthetic_Dataset.xlsx"):
                df_input = pd.read_excel("GeoSafe_Chennai_Synthetic_Dataset.xlsx")
            else:
                raise ValueError("No dataset found to train Random Forest model.")

    df_proc = engineer_features(df_input)

    X = df_proc[FEATURE_COLUMNS]
    y_label = df_proc['Risk_Label'] if 'Risk_Label' in df_proc.columns else df_proc['risk_label']
    y_score = df_proc['Risk_Score'] if 'Risk_Score' in df_proc.columns else df_proc['risk_score']

    # Standardize label casing
    y_label = y_label.astype(str).str.upper()

    X_train, X_test, y_lbl_train, y_lbl_test, y_scr_train, y_scr_test = train_test_split(
        X, y_label, y_score, test_size=0.2, random_state=42, stratify=y_label
    )

    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)

    # Train Random Forest Classifier
    clf = RandomForestClassifier(n_estimators=100, max_depth=12, random_state=42)
    clf.fit(X_train_scaled, y_lbl_train)

    y_lbl_pred = clf.predict(X_test_scaled)
    acc = accuracy_score(y_lbl_test, y_lbl_pred)
    prec = precision_score(y_lbl_test, y_lbl_pred, average='weighted', zero_division=0)
    rec = recall_score(y_lbl_test, y_lbl_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_lbl_test, y_lbl_pred, average='weighted', zero_division=0)

    classes = sorted(y_label.unique().tolist())
    cm = confusion_matrix(y_lbl_test, y_lbl_pred, labels=classes).tolist()

    # Train Random Forest Regressor
    reg = RandomForestRegressor(n_estimators=100, max_depth=12, random_state=42)
    reg.fit(X_train_scaled, y_scr_train)
    y_scr_pred = reg.predict(X_test_scaled)
    r2 = r2_score(y_scr_test, y_scr_pred)

    # Feature Importance calculation
    importances = clf.feature_importances_
    feat_imp = sorted([
        {"feature": feat, "importance": round(float(imp) * 100.0, 2)}
        for feat, imp in zip(FEATURE_COLUMNS, importances)
    ], key=lambda x: x['importance'], reverse=True)

    # Save artifacts
    joblib.dump(clf, os.path.join(MODEL_DIR, "risk_rf_clf.pkl"))
    joblib.dump(reg, os.path.join(MODEL_DIR, "risk_rf_reg.pkl"))
    joblib.dump(scaler, os.path.join(MODEL_DIR, "scaler.pkl"))

    metrics = {
        "dataset_rows": len(df_input),
        "test_rows": len(X_test),
        "accuracy": round(float(acc), 4),
        "precision": round(float(prec), 4),
        "recall": round(float(rec), 4),
        "f1_score": round(float(f1), 4),
        "r2_score": round(float(r2), 4),
        "classes": classes,
        "confusion_matrix": cm,
        "feature_importances": feat_imp,
        "disclaimer": "Performance metrics are based on the provided dataset and represent local evaluation."
    }

    with open(os.path.join(MODEL_DIR, "ml_metrics.json"), "w") as f:
        json.dump(metrics, f, indent=2)

    return metrics
