import os
import json
import joblib
import numpy as np
from typing import Dict, Any, Tuple, List

from backend.config import settings
from backend.services.preprocessing import extract_feature_vector_from_dict, FEATURE_COLUMNS
from backend.ml.train import train_and_save_models

MODEL_DIR = settings.MODEL_DIR

def get_or_load_models():
    clf_path = os.path.join(MODEL_DIR, "risk_rf_clf.pkl")
    reg_path = os.path.join(MODEL_DIR, "risk_rf_reg.pkl")
    scaler_path = os.path.join(MODEL_DIR, "scaler.pkl")

    if not (os.path.exists(clf_path) and os.path.exists(reg_path) and os.path.exists(scaler_path)):
        # Train automatically if models don't exist yet
        train_and_save_models()

    clf = joblib.load(clf_path)
    reg = joblib.load(reg_path)
    scaler = joblib.load(scaler_path)

    metrics = {}
    metrics_path = os.path.join(MODEL_DIR, "ml_metrics.json")
    if os.path.exists(metrics_path):
        with open(metrics_path, "r") as f:
            metrics = json.load(f)

    return clf, reg, scaler, metrics

def predict_risk_from_dict(data: Dict[str, Any]) -> Tuple[float, str, float, Dict[str, float]]:
    clf, reg, scaler, metrics = get_or_load_models()

    vector, feat_dict = extract_feature_vector_from_dict(data)
    vector_scaled = scaler.transform(vector)

    # Regressor score
    pred_score = float(reg.predict(vector_scaled)[0])
    pred_score = round(max(0.0, min(100.0, pred_score)), 1)

    # Classifier label & confidence
    pred_label = str(clf.predict(vector_scaled)[0]).upper()
    probs = clf.predict_proba(vector_scaled)[0]
    confidence = round(float(np.max(probs)) * 100.0, 1)

    # Local feature importance approximation based on feature values & tree importances
    importances = clf.feature_importances_
    scaled_feats = vector_scaled[0]
    
    # Raw impact = |scaled_feature_value| * feature_tree_importance
    raw_impacts = np.abs(scaled_feats) * importances
    sum_impacts = np.sum(raw_impacts) if np.sum(raw_impacts) > 0 else 1.0
    percentages = (raw_impacts / sum_impacts) * 100.0

    feature_contribs = {}
    for col, pct in zip(FEATURE_COLUMNS, percentages):
        feature_contribs[col] = round(float(pct), 1)

    return pred_score, pred_label, confidence, feature_contribs
