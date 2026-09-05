import React from 'react';
import { Shield, Flame, BrainCircuit, Sliders, Navigation, ArrowRight, Activity, MapPin } from 'lucide-react';
import { DashboardSummary } from '../types';

interface LandingPageProps {
  summary: DashboardSummary | null;
  onExplore: (tab: string) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ summary, onExplore }) => {
  return (
    <div className="space-y-12 py-6">
      {/* Hero Section */}
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-navy-950 via-navy-900 to-navy-850 border border-navy-700/80 p-8 md:p-12 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl"></div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-bold uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5" /> Next-Generation Spatiotemporal Safety Intelligence
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Predict danger before it becomes an <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-500">accident.</span>
          </h1>

          <p className="text-slate-300 text-sm md:text-base leading-relaxed">
            GeoSafe is an Explainable Spatiotemporal AI System designed for Chennai road safety. It combines historical accident analytics, DBSCAN spatial clustering, Random Forest predictive risk modeling, Explainable AI (XAI), interactive What-If simulation, and Safety-Aware Route Optimization.
          </p>

          <div className="flex flex-wrap items-center gap-4 pt-2">
            <button
              onClick={() => onExplore('map')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 flex items-center gap-2 transition-all"
            >
              Explore Safety Map <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onExplore('dashboard')}
              className="px-6 py-3 rounded-xl bg-navy-800 hover:bg-navy-700 text-slate-200 font-bold text-xs uppercase tracking-wider border border-navy-700 flex items-center gap-2 transition-all"
            >
              View Intelligence Dashboard
            </button>
          </div>
        </div>
      </div>

      {/* Primary Dataset Quick Stats */}
      {summary && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/60 text-center">
            <div className="text-2xl font-black text-white">{summary.total_accidents}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Total Accidents Analyzed</div>
          </div>
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/60 text-center">
            <div className="text-2xl font-black text-rose-400">{summary.high_risk_accidents}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">High-Risk Incidents</div>
          </div>
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/60 text-center">
            <div className="text-2xl font-black text-amber-400">{summary.detected_hotspots}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">DBSCAN Hotspots</div>
          </div>
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/60 text-center">
            <div className="text-2xl font-black text-cyan-400">{summary.most_dangerous_road}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Highest Severity Corridor</div>
          </div>
          <div className="p-4 rounded-2xl bg-navy-900/80 border border-navy-700/60 text-center col-span-2 md:col-span-1">
            <div className="text-2xl font-black text-emerald-400">{summary.highest_risk_area}</div>
            <div className="text-[10px] font-bold uppercase text-slate-400 mt-1">Top Risk Concentration</div>
          </div>
        </div>
      )}

      {/* Core Novelty Pillars */}
      <div>
        <h2 className="text-xl font-extrabold text-white mb-6 flex items-center gap-2">
          <Shield className="w-5 h-5 text-cyan-400" /> System Innovations & Core Architecture
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 w-fit">
              <Flame className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">1. DBSCAN Spatial Hotspot Detection</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Calculates normalized Hotspot Scores (0-100) using density, casualty weighting, traffic volume, and temporal persistence across Chennai road corridors.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
              <BrainCircuit className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">2. Random Forest & Explainable AI</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Predicts spatial risk levels and provides XAI percentage breakdowns showing exact feature contributions (traffic, weather, time, speed limit) for every query.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400 w-fit">
              <Sliders className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3. Interactive What-If Simulator</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Allows users and urban planners to simulate parameter adjustments (rain, traffic, construction) and evaluate immediate changes in accident risk scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-700/60 space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
              <Navigation className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">4. Safety-Aware Route Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Evaluates candidate routes by comparing Fastest, Balanced, and Safest paths based on custom risk exposure formulas rather than shortest distance alone.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-navy-900/60 border border-navy-700/60 space-y-3 md:col-span-2">
            <div className="p-3 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit">
              <Shield className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">5. Authority Intervention Recommendation Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Translates ML risk factors into prioritized, rule-based engineering interventions for civic authorities (lighting upgrades, speed calming, signal timing optimization, anti-skid resurfacing).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
