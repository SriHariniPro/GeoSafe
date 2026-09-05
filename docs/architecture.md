# GeoSafe System Architecture

GeoSafe is a modular, offline-first spatiotemporal AI decision-support platform for road safety analytics.

## Component Flow Diagram

```
                 ACCIDENT EXCEL DATA (10,000 Records)
                                 |
                                 v
                         DATA INGESTION
                         (data_loader.py)
                                 |
                                 v
                         DATA VALIDATION
                          (validators.py)
                                 |
                                 v
                         SQLITE DATABASE
                           (geosafe.db)
                                 |
             +-------------------+-------------------+
             |                                       |
             v                                       v
      EDA & ANALYTICS                       FEATURE ENGINEERING
         (eda.py)                            (preprocessing.py)
                                                     |
                                   +-----------------+-----------------+
                                   |                                   |
                                   v                                   v
                            DBSCAN CLUSTERING                    RANDOM FOREST
                         (hotspot_detection.py)                 (risk_prediction.py)
                                   |                                   |
                                   v                                   v
                          HOTSPOT SCORE (0-100)                 RISK SCORE & LEVEL
                                   |                                   |
                                   +-----------------+-----------------+
                                                     |
                                                     v
                                          EXPLAINABLE AI ENGINE
                                            (explainability.py)
                                                     |
                  +----------------------------------+----------------------------------+
                  |                                  |                                  |
                  v                                  v                                  v
          HOTSPOT EVOLUTION                 WHAT-IF SIMULATOR                  SAFETY ROUTE ENGINE
           (forecasting.py)                   (simulation.py)                    (route_engine.py)
                  |                                  |                                  |
                  +----------------------------------+----------------------------------+
                                                     |
                                                     v
                                            FASTAPI REST API
                                              (backend/main.py)
                                                     |
                                                     v
                                           VITE REACT FRONTEND
                                              (frontend/src)
```
