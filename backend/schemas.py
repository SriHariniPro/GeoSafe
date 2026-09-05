from pydantic import BaseModel, EmailStr
from typing import Optional, List, Dict, Any
from datetime import datetime

# Auth Schemas
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Optional[str] = "user"

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse

# Accident & Location Metadata Schemas
class AccidentBase(BaseModel):
    accident_id: str
    latitude: float
    longitude: float
    road_name: str
    area: str
    date: str
    time: str
    day_of_week: str
    weather: str
    temperature: Optional[float] = None
    visibility: Optional[float] = None
    traffic_level: str
    road_type: str
    speed_limit: int
    construction: str
    accident_severity: str
    vehicles_involved: int
    fatalities: int
    injuries: int
    risk_score: float
    risk_label: str

class AccidentResponse(AccidentBase):
    class Config:
        from_attributes = True

class DatasetMetadataResponse(BaseModel):
    severities: List[str]
    weather_conditions: List[str]
    traffic_levels: List[str]
    construction_options: List[str]
    areas: List[str]
    roads: List[str]

class LocationItem(BaseModel):
    name: str
    type: str  # 'road' or 'area'
    area: str
    latitude: float
    longitude: float

class ConstructionResponse(BaseModel):
    id: int
    latitude: float
    longitude: float
    road_name: str
    construction_type: str
    severity: str
    status: str

    class Config:
        from_attributes = True

# Hotspot Schemas
class HotspotResponse(BaseModel):
    id: int
    cluster_id: int
    latitude: float
    longitude: float
    accident_count: int
    severity_score: float
    hotspot_score: float
    risk_level: str
    status: str
    dominant_time: Optional[str] = None
    dominant_weather: Optional[str] = None
    area_name: Optional[str] = None
    road_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class HotspotEvolutionResponse(BaseModel):
    period: str
    cluster_id: int
    area_name: str
    accident_count: int
    hotspot_score: float
    status: str

# Risk Prediction Request & Response
class RiskPredictionRequest(BaseModel):
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    road_name: Optional[str] = None
    area: Optional[str] = None
    time: str = "18:30"
    day_of_week: str = "Friday"
    weather: str = "Clear"
    temperature: Optional[float] = 30.0
    visibility: Optional[float] = 5.0
    traffic_level: str = "High"
    road_type: str = "Arterial"
    speed_limit: int = 60
    construction: str = "No"

class FeatureAttribution(BaseModel):
    feature: str
    percentage: float
    impact: str

class RiskPredictionResponse(BaseModel):
    risk_score: float
    risk_level: str
    confidence: float
    resolved_location: str
    latitude: float
    longitude: float
    explanations: List[FeatureAttribution]
    why_risky: List[str]
    reduction_suggestions: List[str]

# Simulation Request & Response
class SimulationRequest(BaseModel):
    latitude: Optional[float] = 13.04
    longitude: Optional[float] = 80.23
    road_name: Optional[str] = "Anna Salai"
    area: Optional[str] = "Teynampet"
    base_time: str = "18:30"
    base_traffic: str = "High"
    base_weather: str = "Clear"
    base_visibility: float = 5.0
    base_construction: str = "No"
    base_speed_limit: int = 60
    sim_time: str = "18:30"
    sim_traffic: str = "Heavy"
    sim_weather: str = "Rain"
    sim_visibility: float = 2.0
    sim_construction: str = "Yes"
    sim_speed_limit: int = 60

class SimulationResponse(BaseModel):
    base_risk_score: float
    base_risk_level: str
    sim_risk_score: float
    sim_risk_level: str
    risk_delta: float
    summary_reason: str
    base_explanations: List[FeatureAttribution]
    sim_explanations: List[FeatureAttribution]

# Route Request & Response
class RouteRequest(BaseModel):
    origin: str
    destination: str

class RouteCandidate(BaseModel):
    strategy: str  # 'FASTEST', 'BALANCED', 'SAFEST'
    distance_km: float
    duration_min: float
    safety_score: float
    risk_level: str
    hotspots_crossed: int
    accidents_near: int
    construction_near: int
    risk_exposure_breakdown: Dict[str, float]
    waypoints: List[List[float]]

class RouteResponse(BaseModel):
    origin: str
    destination: str
    origin_coords: List[float]
    destination_coords: List[float]
    routes: List[RouteCandidate]

# Intervention Schemas
class InterventionUpdate(BaseModel):
    priority: Optional[str] = None
    location_name: Optional[str] = None
    recommended_action: Optional[str] = None
    reason: Optional[str] = None
    expected_impact: Optional[str] = None
    status: Optional[str] = None

class InterventionResponse(BaseModel):
    id: int
    hotspot_id: Optional[int] = None
    location_name: str
    priority: str
    recommended_action: str
    reason: str
    expected_impact: str
    status: str

    class Config:
        from_attributes = True

# Dashboard Summary
class DashboardSummaryResponse(BaseModel):
    total_accidents: int
    high_risk_accidents: int
    detected_hotspots: int
    total_fatalities: int
    total_injuries: int
    average_risk_score: float
    most_dangerous_road: str
    highest_risk_area: str
    todays_safety_insight: str

# EDA Summary
class EDASummaryResponse(BaseModel):
    accidents_by_month: Dict[str, int]
    accidents_by_hour: Dict[str, int]
    accidents_by_day: Dict[str, int]
    severity_distribution: Dict[str, int]
    weather_distribution: Dict[str, int]
    traffic_distribution: Dict[str, int]
    road_type_distribution: Dict[str, int]
    construction_distribution: Dict[str, int]
    traffic_vs_severity: List[Dict[str, Any]]
    weather_vs_severity: List[Dict[str, Any]]
    observations: List[str]
