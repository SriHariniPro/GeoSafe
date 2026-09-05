@echo off
echo Starting GeoSafe FastAPI Backend...
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
pause
