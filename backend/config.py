import os
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "GeoSafe"
    PROJECT_VERSION: str = "1.0.0"
    SECRET_KEY: str = os.getenv("SECRET_KEY", "geosafe-secret-key-change-in-production-2026")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24  # 1 day

    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./geosafe.db")
    DATASET_PATH: str = os.getenv("DATASET_PATH", "data/GeoSafe_Chennai_Synthetic_Dataset.xlsx")
    MODEL_DIR: str = os.getenv("MODEL_DIR", "models")

    class Config:
        env_file = ".env"
        extra = "ignore"

settings = Settings()
