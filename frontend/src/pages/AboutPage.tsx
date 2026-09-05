import React from 'react';
import { Shield, Info, Cpu, Database, Award, AlertCircle, Code, Layers } from 'lucide-react';

export const AboutPage: React.FC = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto py-4">
      {/* Title */}
      <div className="space-y-2">
        <h2 className="text-3xl font-black text-white tracking-tight flex items-center gap-3">
          <Shield className="w-8 h-8 text-cyan-400" /> GeoSafe System Specifications & Architecture
        </h2>
        <p className="text-xs text-slate-400">
          An Explainable Spatiotemporal AI System for Road Accident Hotspot Prediction and Safety-Aware Route Optimization
        </p>
      </div>

      {/* MANDATORY ACADEMIC DISCLAIMER */}
      <div className="p-6 rounded-2xl bg-amber-950/60 border border-amber-800/80 text-amber-200 space-y-2 shadow-xl">
        <h3 className="text-sm font-extrabold uppercase tracking-wider text-amber-400 flex items-center gap-2">
          <AlertCircle className="w-5 h-5 shrink-0" /> Mandatory Project Disclaimer
        </h3>
        <p className="text-xs leading-relaxed font-semibold">
          "GeoSafe is an academic decision-support prototype. Its predictions and risk scores are based on the provided synthetic/semi-synthetic dataset and should not be treated as authoritative real-world accident forecasts or navigation instructions."
        </p>
      </div>

      {/* Technology Stack Grid */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Code className="w-4 h-4 text-cyan-400" /> Technology Stack Breakdown
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Frontend Framework</span>
            <p className="text-slate-300">Vite + React 18 + TypeScript + Tailwind CSS + Lucide Icons</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Backend API</span>
            <p className="text-slate-300">Python 3.12 + FastAPI + Pydantic v2 + SQLAlchemy ORM</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Database & Processing</span>
            <p className="text-slate-300">Local SQLite Database (`geosafe.db`) + Pandas + NumPy + openpyxl</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Machine Learning Engine</span>
            <p className="text-slate-300">Scikit-learn DBSCAN Clustering + Random Forest Classifier & Regressor</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Offline Geospatial Visualization</span>
            <p className="text-slate-300">Leaflet / React-Leaflet with Standalone SVG/Canvas GeoJSON Map Overlay</p>
          </div>
          <div className="p-3.5 rounded-xl bg-navy-850 border border-navy-750 space-y-1">
            <span className="font-bold text-cyan-400 block">Explainable AI (XAI) & Charts</span>
            <p className="text-slate-300">Tree Feature Importance Breakdown + Recharts Interactive Charts</p>
          </div>
        </div>
      </div>

      {/* 5 Core Novelties Summary */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" /> Five Core Project Innovations
        </h3>

        <div className="space-y-3 text-xs text-slate-300">
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <strong className="text-white block mb-0.5">Novelty 1: Predictive Hotspots</strong>
            Predicts spatial-temporal risk levels based on future contextual factors rather than relying solely on past incident locations.
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <strong className="text-white block mb-0.5">Novelty 2: Explainable AI (XAI)</strong>
            Quantifies the exact percentage contributions of traffic, weather, time, speed, and construction to risk score predictions.
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <strong className="text-white block mb-0.5">Novelty 3: What-If Safety Simulator</strong>
            Allows real-time condition modification (e.g. introducing rain or heavy traffic) to compute exact risk score deltas.
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <strong className="text-white block mb-0.5">Novelty 4: Safety-Aware Routing</strong>
            Evaluates candidate paths across Chennai's spatial road graph by comparing Fastest, Balanced, and Safest routes.
          </div>
          <div className="p-3 rounded-xl bg-navy-850 border border-navy-750">
            <strong className="text-white block mb-0.5">Novelty 5: Authority Intervention Intelligence</strong>
            Generates rule-based engineering recommendations (lighting, speed calming, signal timing) prioritized for urban authorities.
          </div>
        </div>
      </div>
    </div>
  );
};
