# GeoSafe Local Setup Guide

Follow these steps to set up and run GeoSafe locally on Windows, Linux, or macOS.

## Prerequisites

- **Python**: 3.10+ (Tested on Python 3.12)
- **Node.js**: v18+ (Tested on Node v22)
- **npm**: v9+

## 1. Quick Setup Script

Run the automated setup script:

```bash
python scripts/setup.py
```

This will automatically:
1. Verify directories (`data/`, `models/`)
2. Initialize the SQLite database schema (`geosafe.db`)
3. Ingest the Excel dataset (`GeoSafe_Chennai_Synthetic_Dataset.xlsx`)
4. Execute DBSCAN spatial hotspot clustering
5. Train the Random Forest ML models and save `.pkl` files to `models/`

## 2. Launch Backend Server

```bash
python -m uvicorn backend.main:app --reload --host 127.0.0.1 --port 8000
```

Backend Swagger Docs: `http://127.0.0.1:8000/docs`

## 3. Launch Frontend Web App

```bash
cd frontend
npm run dev
```

Frontend Application URL: `http://localhost:5173`

## 4. Demo Login Credentials

- **Authority Admin**: `admin@geosafe.local` / `admin123`
- **Standard User**: `user@geosafe.local` / `user123`
