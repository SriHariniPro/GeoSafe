# GeoSafe FastAPI REST API Documentation

Base URL: `http://localhost:8000/api`

Swagger Interactive UI: `http://localhost:8000/docs`

## Endpoints Summary

### Authentication
- `POST /api/auth/register`: Register user account
- `POST /api/auth/login`: Authenticate and obtain JWT token
- `GET /api/auth/me`: Get current authenticated user profile

### Accidents Data
- `GET /api/accidents`: Query accidents with pagination, search, & filters
- `GET /api/accidents/{id}`: Get single accident record details
- `POST /api/accidents`: Add new accident record
- `POST /api/accidents/upload`: Upload Excel dataset file (.xlsx)
- `DELETE /api/accidents/{id}`: Delete accident record

### Hotspots & Evolution
- `GET /api/hotspots`: Get detected DBSCAN hotspots
- `GET /api/hotspots/evolution`: Get hotspot trajectory evolution analysis
- `POST /api/hotspots/detect`: Trigger DBSCAN spatial clustering

### Predictive Risk & XAI
- `POST /api/risk/predict`: Calculate predicted risk score, level, confidence, and XAI feature attributions
- `GET /api/risk/areas`: Get spatial grid risk scores across Chennai

### What-If Simulation
- `POST /api/simulation/what-if`: Execute side-by-side scenario simulation and compute risk delta

### Safety-Aware Routes
- `POST /api/routes/analyze`: Compare candidate route paths (Fastest, Balanced, Safest)

### Authority Interventions
- `GET /api/interventions`: Get authority intervention recommendations
- `POST /api/interventions/generate`: Generate/refresh interventions

### Analytics & EDA
- `GET /api/analytics/eda`: Get exploratory data analysis charts & distributions

### Dashboard & Health
- `GET /api/dashboard`: Get dashboard summary KPI cards
- `GET /api/health`: System health check status
