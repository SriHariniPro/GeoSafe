import React, { useEffect, useState } from 'react';
import { MapPin, Filter, RefreshCw } from 'lucide-react';
import { OfflineMap } from '../components/map/OfflineMap';
import { getAccidents, getHotspots, getDatasetMetadata, getConstructionSites } from '../services/api';
import { Accident, Hotspot, DatasetMetadata, ConstructionSite } from '../types';

export const SafetyMap: React.FC = () => {
  const [accidents, setAccidents] = useState<Accident[]>([]);
  const [hotspots, setHotspots] = useState<Hotspot[]>([]);
  const [constructionSites, setConstructionSites] = useState<ConstructionSite[]>([]);
  const [metadata, setMetadata] = useState<DatasetMetadata | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [severityFilter, setSeverityFilter] = useState('');
  const [weatherFilter, setWeatherFilter] = useState('');
  const [trafficFilter, setTrafficFilter] = useState('');
  const [constructionFilter, setConstructionFilter] = useState('');
  const [areaFilter, setAreaFilter] = useState('');

  // Initial metadata fetch
  useEffect(() => {
    getDatasetMetadata()
      .then(setMetadata)
      .catch(err => console.error('Metadata fetch error:', err));

    getConstructionSites()
      .then(setConstructionSites)
      .catch(err => console.error('Construction sites error:', err));
  }, []);

  const fetchMapData = async () => {
    setLoading(true);
    try {
      const params: Record<string, any> = { limit: 1000 };
      if (severityFilter) params.severity = severityFilter;
      if (weatherFilter) params.weather = weatherFilter;
      if (trafficFilter) params.traffic = trafficFilter;
      if (constructionFilter) params.construction = constructionFilter;
      if (areaFilter) params.area = areaFilter;

      const [accRes, hsRes] = await Promise.all([
        getAccidents(params),
        getHotspots()
      ]);
      setAccidents(accRes.accidents || []);
      setHotspots(hsRes || []);
    } catch (err) {
      console.error('Failed to load map data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMapData();
  }, [severityFilter, weatherFilter, trafficFilter, constructionFilter, areaFilter]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-cyan-400" /> Interactive Chennai Safety Map
          </h2>
          <p className="text-xs text-slate-400">Offline spatial visualization of accidents, DBSCAN hotspots, and construction overlays</p>
        </div>

        <button
          onClick={fetchMapData}
          className="px-4 py-2 rounded-xl bg-navy-800 hover:bg-navy-750 text-slate-300 border border-navy-700 text-xs font-bold flex items-center gap-2 transition-all w-fit"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Map Layers
        </button>
      </div>

      {/* Dynamic Filter Control Bar */}
      <div className="p-4 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-cyan-400" /> Global Dynamic Filters
          </div>
          <span className="text-[10px] text-cyan-400 font-mono">
            Showing {accidents.length} accident markers & {constructionSites.length} construction zones
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
          {/* Severity */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Severity</label>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
            >
              <option value="">All Severities</option>
              {metadata?.severities.map(s => <option key={`sev-${s}`} value={s}>{s}</option>) || (
                <>
                  <option value="Fatal">Fatal</option>
                  <option value="Severe">Severe</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Minor">Minor</option>
                </>
              )}
            </select>
          </div>

          {/* Weather */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weather</label>
            <select
              value={weatherFilter}
              onChange={(e) => setWeatherFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
            >
              <option value="">All Weather</option>
              {metadata?.weather_conditions.map(w => <option key={`wth-${w}`} value={w}>{w}</option>) || (
                <>
                  <option value="Clear">Clear</option>
                  <option value="Rain">Rain</option>
                  <option value="Heavy Rain">Heavy Rain</option>
                  <option value="Fog/Mist">Fog / Mist</option>
                </>
              )}
            </select>
          </div>

          {/* Traffic Level */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Traffic Level</label>
            <select
              value={trafficFilter}
              onChange={(e) => setTrafficFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
            >
              <option value="">All Traffic Levels</option>
              {metadata?.traffic_levels.map(t => <option key={`trf-${t}`} value={t}>{t}</option>) || (
                <>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                  <option value="Heavy">Heavy</option>
                </>
              )}
            </select>
          </div>

          {/* Construction Zone */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Construction Zone</label>
            <select
              value={constructionFilter}
              onChange={(e) => setConstructionFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
            >
              <option value="">All Locations</option>
              <option value="Yes">Construction (Yes)</option>
              <option value="No">No Construction (No)</option>
            </select>
          </div>

          {/* Area Region */}
          <div>
            <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Area Region</label>
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full px-2.5 py-1.5 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
            >
              <option value="">All Chennai Areas</option>
              {metadata?.areas.map(a => <option key={`area-${a}`} value={a}>{a}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Main Map Rendering Component */}
      <OfflineMap
        accidents={accidents}
        hotspots={hotspots}
        constructionSites={constructionSites}
        height="650px"
      />
    </div>
  );
};
