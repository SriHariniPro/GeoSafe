import React, { useState, useEffect } from 'react';
import { Navigation, ArrowRight, Clock, MapPin, AlertTriangle, ShieldCheck, Flame, Construction as HardHat } from 'lucide-react';
import { analyzeRoute, getAccidents, getHotspots, getConstructionSites } from '../services/api';
import { RouteResponse, RouteCandidate, Accident, Hotspot, ConstructionSite, LocationItem } from '../types';
import { OfflineMap } from '../components/map/OfflineMap';
import { RiskBadge } from '../components/common/RiskBadge';
import { LocationAutocomplete } from '../components/common/LocationAutocomplete';

export const RouteSafety: React.FC = () => {
  const [origin, setOrigin] = useState('Central Station');
  const [destination, setDestination] = useState('Tambaram');

  const [routeResult, setRouteResult] = useState<RouteResponse | null>(null);
  const [selectedRoute, setSelectedRoute] = useState<RouteCandidate | null>(null);
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getAccidents({ limit: 400 }).then(res => setAccidents(res.accidents || [])).catch(() => {});
    getHotspots().then(setHotspots).catch(() => {});
    getConstructionSites().then(setConstructionSites).catch(() => {});
  }, []);

  const handleAnalyze = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await analyzeRoute(origin, destination);
      setRouteResult(res);
      if (res.routes && res.routes.length > 0) {
        const safest = res.routes.find(r => r.strategy === 'SAFEST');
        setSelectedRoute(safest || res.routes[0]);
      }
    } catch (err) {
      console.error('Route analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStrategyBadge = (strat: string) => {
    switch (strat) {
      case 'SAFEST': return 'bg-emerald-100 text-emerald-900 dark:bg-emerald-950 dark:text-emerald-300 border-emerald-400 dark:border-emerald-800 font-black';
      case 'BALANCED': return 'bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 border-amber-400 dark:border-amber-800 font-black';
      case 'FASTEST': return 'bg-rose-100 text-rose-900 dark:bg-rose-950 dark:text-rose-300 border-rose-400 dark:border-rose-800 font-black';
      case 'DIRECT': return 'bg-cyan-100 text-cyan-900 dark:bg-cyan-950 dark:text-cyan-300 border-cyan-400 dark:border-cyan-800 font-black';
      case 'BYPASS': return 'bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 border-purple-400 dark:border-purple-800 font-black';
      default: return 'bg-slate-100 text-slate-900 dark:bg-slate-900 dark:text-slate-300 border-slate-300 dark:border-slate-700 font-black';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-emerald-500" /> Safety-Aware Route Optimization Engine
        </h2>
        <p className="text-xs text-slate-600 dark:text-slate-400">Search origin and destination to compare 5 route alternatives with hotspot-evasive routing</p>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Origin & Destination Autocomplete Form */}
        <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-white dark:bg-navy-900 border border-slate-200 dark:border-navy-700/60 shadow-xl space-y-4 xl:col-span-1 h-fit">
          <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">From → To Route Query</h3>

          {/* Origin Autocomplete */}
          <LocationAutocomplete
            label="FROM (Origin Location)"
            placeholder="Type origin road or area..."
            value={origin}
            onChange={(val) => setOrigin(val)}
            required
          />

          {/* Destination Autocomplete */}
          <LocationAutocomplete
            label="TO (Destination Location)"
            placeholder="Type destination road or area..."
            value={destination}
            onChange={(val) => setDestination(val)}
            required
          />

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-600/20 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Evaluating 5 Spatial Routes...' : 'Analyze 5 Safety Routes'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Route Output & Strategy Comparison */}
        <div className="xl:col-span-3 space-y-6">
          {routeResult ? (
            <>
              {/* 5 Route Candidate Strategy Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
                {routeResult.routes.map((rt) => (
                  <button
                    key={rt.strategy}
                    onClick={() => setSelectedRoute(rt)}
                    className={`p-4 rounded-2xl border text-left transition-all space-y-2.5 flex flex-col justify-between ${
                      selectedRoute?.strategy === rt.strategy
                        ? 'bg-emerald-50/60 dark:bg-navy-850 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-2 ring-emerald-500'
                        : 'bg-white dark:bg-navy-900 border-slate-200 dark:border-navy-750 hover:bg-slate-50 dark:hover:bg-navy-850/50 shadow-sm'
                    }`}
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between gap-1">
                        <span className={`text-[10px] uppercase px-2 py-0.5 rounded border ${getStrategyBadge(rt.strategy)}`}>
                          {rt.strategy}
                        </span>
                        <RiskBadge level={rt.risk_level} size="sm" />
                      </div>

                      <div>
                        <div className="text-2xl font-black text-slate-950 dark:text-white flex items-baseline gap-1">
                          <span>{rt.safety_score}</span>
                          <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold">/ 100</span>
                        </div>
                        <span className="text-[9px] text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Safety Score</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 text-[11px] border-t border-slate-200 dark:border-navy-750 pt-2 text-slate-700 dark:text-slate-300 font-medium w-full">
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Distance & Time:</span>
                        <span className="font-bold text-slate-900 dark:text-white">{rt.distance_km} km ({rt.duration_min}m)</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-500 dark:text-slate-400">Hotspots:</span>
                        {rt.hotspots_crossed === 0 ? (
                          <span className="text-emerald-800 dark:text-emerald-300 bg-emerald-100 dark:bg-emerald-950 px-1.5 py-0.5 rounded font-black text-[10px] border border-emerald-300 dark:border-emerald-800">0 (Zero Hotspot)</span>
                        ) : (
                          <span className="text-rose-600 dark:text-rose-400 font-extrabold">{rt.hotspots_crossed}</span>
                        )}
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Accidents Near:</span>
                        <span className="text-amber-800 dark:text-amber-400 font-bold">{rt.accidents_near}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500 dark:text-slate-400">Construction:</span>
                        <span className="text-yellow-800 dark:text-yellow-400 font-bold">{rt.construction_near}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Multi-Layer Route Map */}
              {selectedRoute && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
                    <span>Displaying Map Layers for <strong className="text-slate-900 dark:text-white">{selectedRoute.strategy} Strategy</strong> ({routeResult.origin} → {routeResult.destination})</span>
                  </div>
                  <OfflineMap
                    accidents={accidents}
                    hotspots={hotspots}
                    constructionSites={constructionSites}
                    routeWaypoints={selectedRoute.waypoints}
                    routeStrategy={selectedRoute.strategy}
                    selectedLocation={routeResult.origin_coords}
                    height="500px"
                  />
                </div>
              )}
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-white dark:bg-navy-900/60 border border-slate-200 dark:border-navy-700/60 text-center space-y-3 shadow-sm">
              <Navigation className="w-12 h-12 text-slate-400 mx-auto" />
              <h3 className="text-base font-bold text-slate-800 dark:text-slate-300">Safety-Aware Route Comparison (5 Strategies)</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Type an Origin and Destination into the search fields on the left and click "Analyze 5 Safety Routes" to compare FASTEST, BALANCED, SAFEST (Zero-Hotspot Bypass), DIRECT, and BYPASS corridors.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
