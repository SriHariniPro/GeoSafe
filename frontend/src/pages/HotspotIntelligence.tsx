import React, { useEffect, useState } from 'react';
import { Flame, Activity, RefreshCw, TrendingUp, AlertTriangle, ShieldCheck } from 'lucide-react';
import { getHotspots, getHotspotEvolution, triggerHotspotDetection } from '../services/api';
import { Hotspot, HotspotEvolution } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';

export const HotspotIntelligence: React.FC = () => {
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [evolution, setEvolution] = useState<HotspotEvolution[]>([]);
  const [loading, setLoading] = useState(true);
  const [eps, setEps] = useState(0.8);
  const [minSamples, setMinSamples] = useState(5);
  const [recomputing, setRecomputing] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [hsData, evoData] = await Promise.all([
        getHotspots(),
        getHotspotEvolution()
      ]);
      setHotspots(hsData || []);
      setEvolution(evoData || []);
    } catch (err) {
      console.error('Failed to load hotspot data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRedetect = async () => {
    setRecomputing(true);
    try {
      await triggerHotspotDetection(eps, minSamples);
      await fetchData();
    } catch (err) {
      console.error('Re-detection failed:', err);
    } finally {
      setRecomputing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'EMERGING': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'WORSENING': return 'bg-rose-950 text-rose-400 border-rose-800';
      case 'PERSISTENT': return 'bg-purple-950 text-purple-400 border-purple-800';
      case 'IMPROVING': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'DISAPPEARING': return 'bg-slate-900 text-slate-400 border-slate-700';
      default: return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Flame className="w-6 h-6 text-rose-500 animate-pulse" /> DBSCAN Spatial Hotspot & Evolution Engine
          </h2>
          <p className="text-xs text-slate-400">Haversine density clustering and temporal trajectory classification</p>
        </div>

        {/* Re-clustering Control Bar */}
        <div className="flex items-center gap-3 bg-navy-900 p-2.5 rounded-2xl border border-navy-700 shadow-lg">
          <div>
            <label className="text-[9px] font-bold text-slate-400 block">EPS Radius (km)</label>
            <input
              type="number"
              step="0.1"
              value={eps}
              onChange={(e) => setEps(parseFloat(e.target.value))}
              className="w-16 px-2 py-1 bg-navy-800 border border-navy-700 rounded text-xs text-white text-center font-bold"
            />
          </div>
          <div>
            <label className="text-[9px] font-bold text-slate-400 block">Min Samples</label>
            <input
              type="number"
              value={minSamples}
              onChange={(e) => setMinSamples(parseInt(e.target.value))}
              className="w-16 px-2 py-1 bg-navy-800 border border-navy-700 rounded text-xs text-white text-center font-bold"
            />
          </div>
          <button
            onClick={handleRedetect}
            disabled={recomputing}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-md"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${recomputing ? 'animate-spin' : ''}`} />
            {recomputing ? 'Clustering...' : 'Re-Run DBSCAN'}
          </button>
        </div>
      </div>

      {/* DBSCAN Hotspots Table */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Activity className="w-4 h-4 text-cyan-400" /> Active Spatial Hotspot Clusters ({hotspots.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-navy-750 text-[10px] uppercase tracking-wider text-slate-400 bg-navy-950/60">
                <th className="p-3">Cluster ID</th>
                <th className="p-3">Road / Corridor</th>
                <th className="p-3">Area</th>
                <th className="p-3">Accident Count</th>
                <th className="p-3">Avg Severity</th>
                <th className="p-3">Hotspot Score</th>
                <th className="p-3">Risk Level</th>
                <th className="p-3">Peak Time</th>
                <th className="p-3">Dominant Weather</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-navy-800 text-xs">
              {hotspots.map((hs) => (
                <tr key={hs.id} className="hover:bg-navy-800/50 transition-all">
                  <td className="p-3 font-bold text-rose-400">#{hs.cluster_id}</td>
                  <td className="p-3 font-bold text-white">{hs.road_name || 'Corridor'}</td>
                  <td className="p-3 text-slate-300">{hs.area_name || 'Chennai'}</td>
                  <td className="p-3 font-extrabold text-white">{hs.accident_count}</td>
                  <td className="p-3 font-bold text-amber-400">{hs.severity_score}/5.0</td>
                  <td className="p-3 font-black text-cyan-400">{hs.hotspot_score}</td>
                  <td className="p-3">
                    <RiskBadge level={hs.risk_level} size="sm" />
                  </td>
                  <td className="p-3 text-slate-300">{hs.dominant_time}</td>
                  <td className="p-3 text-slate-300">{hs.dominant_weather}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Hotspot Evolution Section */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-amber-400" /> Hotspot Trajectory & Evolution Analysis
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {evolution.map((evo) => (
            <div key={`evo-${evo.hotspot_id}`} className="p-4 rounded-xl bg-navy-850 border border-navy-750 space-y-3">
              <div className="flex items-center justify-between">
                <span className="font-bold text-xs text-white">{evo.road_name}</span>
                <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded border ${getStatusColor(evo.status)}`}>
                  {evo.status}
                </span>
              </div>
              <p className="text-[11px] text-slate-400">{evo.area_name}</p>

              <div className="flex items-center justify-between pt-2 border-t border-navy-750 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 block">Count Change</span>
                  <span className="font-bold text-slate-200">{evo.previous_count} → {evo.current_count}</span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 block">Growth Pct</span>
                  <span className={`font-black ${evo.change_pct > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                    {evo.change_pct > 0 ? `+${evo.change_pct}%` : `${evo.change_pct}%`}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
