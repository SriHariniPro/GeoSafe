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
        setSelectedRoute(res.routes[2] || res.routes[0]); // Default to SAFEST route
      }
    } catch (err) {
      console.error('Route analysis error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStrategyBadge = (strat: string) => {
    switch (strat) {
      case 'SAFEST': return 'bg-emerald-950 text-emerald-400 border-emerald-800';
      case 'BALANCED': return 'bg-amber-950 text-amber-400 border-amber-800';
      case 'FASTEST': return 'bg-rose-950 text-rose-400 border-rose-800';
      default: return 'bg-slate-900 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <Navigation className="w-6 h-6 text-emerald-400" /> Safety-Aware Route Optimization Engine
        </h2>
        <p className="text-xs text-slate-400">Search origin and destination to compare Fastest, Balanced, and Safest route exposure</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Origin & Destination Autocomplete Form */}
        <form onSubmit={handleAnalyze} className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">From → To Route Query</h3>

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
            {loading ? 'Evaluating Spatial Graph...' : 'Analyze Route Safety'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Route Output & Strategy Comparison */}
        <div className="lg:col-span-2 space-y-6">
          {routeResult ? (
            <>
              {/* Route Candidate Strategy Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {routeResult.routes.map((rt) => (
                  <button
                    key={rt.strategy}
                    onClick={() => setSelectedRoute(rt)}
                    className={`p-5 rounded-2xl border text-left transition-all space-y-3 ${
                      selectedRoute?.strategy === rt.strategy
                        ? 'bg-navy-850 border-emerald-500 shadow-xl shadow-emerald-500/10 ring-1 ring-emerald-500'
                        : 'bg-navy-900 border-navy-750 hover:bg-navy-850/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${getStrategyBadge(rt.strategy)}`}>
                        {rt.strategy}
                      </span>
                      <RiskBadge level={rt.risk_level} size="sm" />
                    </div>

                    <div>
                      <div className="text-3xl font-black text-white">{rt.safety_score} <span className="text-xs text-slate-500 font-normal">/ 100</span></div>
                      <span className="text-[10px] text-slate-400 font-bold uppercase">Safety Score</span>
                    </div>

                    <div className="space-y-1 text-xs border-t border-navy-750 pt-2 text-slate-300">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Distance & Time:</span>
                        <span className="font-bold">{rt.distance_km} km ({rt.duration_min} min)</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Hotspots Crossed:</span>
                        <span className="text-rose-400 font-bold">{rt.hotspots_crossed}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Accidents Near:</span>
                        <span className="text-amber-400 font-bold">{rt.accidents_near}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Construction Near:</span>
                        <span className="text-yellow-400 font-bold">{rt.construction_near}</span>
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Multi-Layer Route Map */}
              {selectedRoute && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Displaying Map Layers for <strong className="text-white">{selectedRoute.strategy} Strategy</strong> ({routeResult.origin} → {routeResult.destination})</span>
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
            <div className="p-12 rounded-2xl bg-navy-900/60 border border-navy-700/60 text-center space-y-3">
              <Navigation className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Safety-Aware Route Comparison</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Type an Origin and Destination into the search fields on the left and click "Analyze Route Safety" to compare routes and view accident, hotspot, and construction map layers.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
