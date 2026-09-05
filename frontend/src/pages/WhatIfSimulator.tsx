import React, { useState } from 'react';
import { Sliders, ArrowRight, Activity, AlertTriangle, ArrowUpRight, ArrowDownRight, Sparkles } from 'lucide-react';
import { runSimulation } from '../services/api';
import { SimulationResponse } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const WhatIfSimulator: React.FC = () => {
  // Baseline Scenario
  const [baseTime, setBaseTime] = useState('18:30');
  const [baseTraffic, setBaseTraffic] = useState('Medium');
  const [baseWeather, setBaseWeather] = useState('Clear');
  const [baseConstruction, setBaseConstruction] = useState('No');
  const [baseSpeedLimit, setBaseSpeedLimit] = useState(60);

  // Simulation Scenario
  const [simTime, setSimTime] = useState('18:30');
  const [simTraffic, setSimTraffic] = useState('Heavy');
  const [simWeather, setSimWeather] = useState('Rain');
  const [simConstruction, setSimConstruction] = useState('Yes');
  const [simSpeedLimit, setSimSpeedLimit] = useState(60);

  const [result, setResult] = useState<SimulationResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSimulate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await runSimulation({
        latitude: 13.0405, longitude: 80.2356, road_name: 'Anna Salai', area: 'Chennai',
        base_time: baseTime, base_traffic: baseTraffic, base_weather: baseWeather, base_construction: baseConstruction, base_speed_limit: baseSpeedLimit,
        sim_time: simTime, sim_traffic: simTraffic, sim_weather: simWeather, sim_construction: simConstruction, sim_speed_limit: simSpeedLimit
      });
      setResult(res);
    } catch (err) {
      console.error('Simulation failed:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Sliders className="w-6 h-6 text-amber-400" /> Interactive "What-If" Road Safety Simulator
        </h2>
        <p className="text-xs text-slate-400">Simulate condition adjustments and quantify real-time risk score deltas</p>
      </div>

      {/* Control Form Grid */}
      <form onSubmit={handleSimulate} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Baseline Scenario Form */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-cyan-400 border-b border-navy-750 pb-2">
              Baseline Scenario 1
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Time</label>
                <input
                  type="time"
                  value={baseTime}
                  onChange={(e) => setBaseTime(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Traffic Level</label>
                <select
                  value={baseTraffic}
                  onChange={(e) => setBaseTraffic(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  {['Low', 'Medium', 'High', 'Heavy', 'Congested'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Weather</label>
                <select
                  value={baseWeather}
                  onChange={(e) => setBaseWeather(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  {['Clear', 'Cloudy', 'Fog/Mist', 'Rain', 'Heavy Rain'].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Construction</label>
                <select
                  value={baseConstruction}
                  onChange={(e) => setBaseConstruction(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>

          {/* Scenario 2 Form */}
          <div className="p-5 rounded-2xl bg-navy-900 border border-amber-500/30 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-amber-400 border-b border-navy-750 pb-2">
              Modified "What-If" Scenario 2
            </h3>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Time</label>
                <input
                  type="time"
                  value={simTime}
                  onChange={(e) => setSimTime(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Traffic Level</label>
                <select
                  value={simTraffic}
                  onChange={(e) => setSimTraffic(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  {['Low', 'Medium', 'High', 'Heavy', 'Congested'].map(t => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Weather</label>
                <select
                  value={simWeather}
                  onChange={(e) => setSimWeather(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  {['Clear', 'Cloudy', 'Fog/Mist', 'Rain', 'Heavy Rain'].map(w => <option key={w} value={w}>{w}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 block mb-1">Construction</label>
                <select
                  value={simConstruction}
                  onChange={(e) => setSimConstruction(e.target.value)}
                  className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
                >
                  <option value="No">No</option>
                  <option value="Yes">Yes</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-500 hover:to-rose-500 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-amber-600/20 transition-all flex items-center justify-center gap-2"
        >
          {loading ? 'Simulating ML Risk Delta...' : 'Execute What-If Simulation'} <ArrowRight className="w-4 h-4" />
        </button>
      </form>

      {/* Simulation Result Comparison Output */}
      {result && (
        <div className="p-6 rounded-3xl bg-navy-900 border border-navy-700/80 shadow-2xl space-y-6">
          {/* Risk Summary Reason Banner */}
          <div className={`p-4 rounded-2xl border backdrop-blur-md flex items-center gap-3 ${
            result.risk_delta > 0 
              ? 'bg-rose-950/80 text-rose-300 border-rose-800/80' 
              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800/80'
          }`}>
            {result.risk_delta > 0 ? <ArrowUpRight className="w-6 h-6 shrink-0" /> : <ArrowDownRight className="w-6 h-6 shrink-0" />}
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider block opacity-80">Simulation Risk Delta Result</span>
              <p className="text-sm font-extrabold">{result.summary_reason}</p>
            </div>
          </div>

          {/* Visual Risk Meters Side-by-Side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Baseline Meter */}
            <div className="p-5 rounded-2xl bg-navy-850 border border-navy-750 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Baseline Risk Meter</span>
                <RiskBadge level={result.base_risk_level} />
              </div>
              <div className="text-4xl font-black text-white">{result.base_risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
              <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-cyan-500 rounded-full transition-all duration-500" style={{ width: `${result.base_risk_score}%` }}></div>
              </div>
            </div>

            {/* Simulation Meter */}
            <div className="p-5 rounded-2xl bg-navy-850 border border-amber-500/30 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300">Scenario 2 Risk Meter</span>
                <RiskBadge level={result.sim_risk_level} />
              </div>
              <div className="text-4xl font-black text-amber-400">{result.sim_risk_score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
              <div className="w-full h-3 bg-navy-800 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full transition-all duration-500" style={{ width: `${result.sim_risk_score}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
