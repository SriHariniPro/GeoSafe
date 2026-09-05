# GeoSafe Machine Learning Methodology

GeoSafe incorporates a multi-tiered data science and machine learning pipeline for spatiotemporal analytics.

## 1. DBSCAN Spatial Clustering (Hotspot Detection)

- **Algorithm**: Density-Based Spatial Clustering of Applications with Noise (DBSCAN).
- **Distance Metric**: Haversine distance on spherical coordinates ($\text{radius} \approx 6371\text{ km}$).
- **Formula**:
  $$\text{Hotspot Score} = \min\left(100, \, 0.35 \times \text{Density} + 0.30 \times \text{Severity} + 0.15 \times \text{Casualties} + 0.10 \times \text{Exposure} + 0.10 \times \text{Risk}\right)$$

## 2. Random Forest Predictive Risk Engine

- **Model**: Scikit-learn `RandomForestClassifier` (100 estimators, max depth 12) & `RandomForestRegressor`.
- **Target**: `Risk_Label` (`Low`, `Medium`, `High`, `Critical`) and continuous `Risk_Score` ($0-100$).
- **Features**: `hour`, `is_weekend`, `is_night`, `is_peak_hour`, `weather_code`, `traffic_code`, `road_type_code`, `speed_limit`, `construction_code`, `visibility`, `temperature`, `traffic_severity_index`, `weather_risk_index`.

## 3. Explainable AI (XAI) Feature Attribution

- **Local Feature Attribution**: Computes scaled feature magnitude multiplied by decision tree feature importances to calculate percentage contributions ($\sum \text{percentage} = 100\%$).
- **Outputs**:
  - Horizontal feature attribution bar chart.
  - "Why is this area risky?" natural language breakdown.
  - "How can risk be reduced?" intervention actions.

## 4. Safety-Aware Route Optimization

- **Route Risk Formula**:
  $$\text{Route Risk} = 0.40 \times \text{Avg Hotspot Score} + 0.30 \times \text{Hotspot Exposure} + 0.20 \times \text{Traffic Exposure} + 0.10 \times \text{Distance Weight}$$
- **Safety Score**:
  $$\text{Safety Score} = \max(0, \, 100 - \text{Route Risk})$$
- **Candidate Comparison**: Compares `FASTEST`, `BALANCED`, and `SAFEST` strategies.
