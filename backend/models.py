from sqlalchemy import Column, Integer, Float, String, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from backend.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(100), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    role = Column(String(20), default="user")  # 'user' or 'admin' / 'authority'
    created_at = Column(DateTime, default=datetime.utcnow)

    saved_routes = relationship("SavedRoute", back_populates="user")


class Accident(Base):
    __tablename__ = "accidents"

    accident_id = Column(String(50), primary_key=True, index=True)
    latitude = Column(Float, nullable=False, index=True)
    longitude = Column(Float, nullable=False, index=True)
    road_name = Column(String(150), nullable=False, index=True)
    area = Column(String(100), nullable=False, index=True)
    date = Column(String(20), nullable=False)
    time = Column(String(20), nullable=False)
    day_of_week = Column(String(20), nullable=False)
    weather = Column(String(50), nullable=False)
    temperature = Column(Float, nullable=True)
    visibility = Column(Float, nullable=True)
    traffic_level = Column(String(50), nullable=False)
    road_type = Column(String(50), nullable=False)
    speed_limit = Column(Integer, nullable=False)
    construction = Column(String(10), default="No")
    accident_severity = Column(String(50), nullable=False)
    vehicles_involved = Column(Integer, default=1)
    fatalities = Column(Integer, default=0)
    injuries = Column(Integer, default=0)
    risk_score = Column(Float, nullable=False)
    risk_label = Column(String(50), nullable=False)


class Hotspot(Base):
    __tablename__ = "hotspots"

    id = Column(Integer, primary_key=True, index=True)
    cluster_id = Column(Integer, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    accident_count = Column(Integer, nullable=False)
    severity_score = Column(Float, nullable=False)
    hotspot_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    status = Column(String(50), default="Active")  # Emerging, Persistent, Worsening, Improving, Disappearing
    dominant_time = Column(String(50), nullable=True)
    dominant_weather = Column(String(50), nullable=True)
    area_name = Column(String(100), nullable=True)
    road_name = Column(String(150), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)

    interventions = relationship("Intervention", back_populates="hotspot")


class RiskPrediction(Base):
    __tablename__ = "risk_predictions"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    time_period = Column(String(50), nullable=False)
    risk_score = Column(Float, nullable=False)
    risk_level = Column(String(50), nullable=False)
    confidence = Column(Float, nullable=False)
    explanation = Column(Text, nullable=True)  # JSON string of feature attributions
    created_at = Column(DateTime, default=datetime.utcnow)


class ConstructionSite(Base):
    __tablename__ = "construction"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    road_name = Column(String(150), nullable=False)
    construction_type = Column(String(100), nullable=False)
    severity = Column(String(50), default="Medium")
    start_date = Column(String(20), nullable=True)
    end_date = Column(String(20), nullable=True)
    status = Column(String(50), default="Active")


class SavedRoute(Base):
    __tablename__ = "saved_routes"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    origin = Column(String(150), nullable=False)
    destination = Column(String(150), nullable=False)
    route_type = Column(String(50), nullable=False)  # Fastest, Balanced, Safest
    distance = Column(Float, nullable=False)
    estimated_time = Column(Float, nullable=False)
    safety_score = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="saved_routes")


class Intervention(Base):
    __tablename__ = "interventions"

    id = Column(Integer, primary_key=True, index=True)
    hotspot_id = Column(Integer, ForeignKey("hotspots.id"), nullable=True)
    location_name = Column(String(150), nullable=False)
    priority = Column(String(50), nullable=False)  # Critical, High, Medium, Low
    recommended_action = Column(String(255), nullable=False)
    reason = Column(Text, nullable=False)
    expected_impact = Column(String(255), nullable=False)
    status = Column(String(50), default="Pending")

    hotspot = relationship("Hotspot", back_populates="interventions")


class SystemLog(Base):
    __tablename__ = "logs"

    id = Column(Integer, primary_key=True, index=True)
    event = Column(String(255), nullable=False)
    user = Column(String(100), default="System")
    timestamp = Column(DateTime, default=datetime.utcnow)
