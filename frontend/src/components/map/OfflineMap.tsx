import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, Circle, LayerGroup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Accident, Hotspot, ConstructionSite } from '../../types';
import { Wifi, WifiOff } from 'lucide-react';

const createAccidentIcon = (severity: string) => {
  let color = '#10b981';
  if (severity === 'Fatal') color = '#ef4444';
  else if (severity === 'Severe') color = '#f97316';
  else if (severity === 'Moderate') color = '#f59e0b';

  return L.divIcon({
    className: 'custom-accident-marker',
    html: `<div style="background-color: ${color}; width: 10px; height: 10px; border-radius: 50%; border: 2px solid #ffffff; box-shadow: 0 0 8px ${color};"></div>`,
    iconSize: [10, 10],
    iconAnchor: [5, 5]
  });
};

const createHotspotIcon = (riskLevel: string, score: number) => {
  let color = '#ef4444';
  if (riskLevel === 'MEDIUM') color = '#f59e0b';
  else if (riskLevel === 'HIGH') color = '#f97316';

  return L.divIcon({
    className: 'custom-hotspot-marker',
    html: `
      <div style="background-color: ${color}cc; width: 28px; height: 28px; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 11px; box-shadow: 0 0 14px ${color};">
        ${score}
      </div>
    `,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

const createConstructionIcon = () => {
  return L.divIcon({
    className: 'custom-construction-marker',
    html: `<div style="background-color: #eab308; width: 20px; height: 20px; border-radius: 6px; border: 2px solid #000; display: flex; align-items: center; justify-content: center; color: black; font-weight: 900; font-size: 11px; box-shadow: 0 0 10px #eab308;">🚧</div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10]
  });
};

interface OfflineMapProps {
  accidents?: Accident[];
  hotspots?: Hotspot[];
  constructionSites?: ConstructionSite[];
  routeWaypoints?: [number, number][];
  routeStrategy?: string;
  selectedLocation?: [number, number];
  height?: string;
}

// Auto Map Viewport Fitter Component
const MapBoundsFitter: React.FC<{ waypoints?: [number, number][]; selectedLocation?: [number, number] }> = ({ waypoints, selectedLocation }) => {
  const map = useMap();

  useEffect(() => {
    if (waypoints && waypoints.length > 1) {
      const bounds = L.latLngBounds(waypoints.map(pt => [pt[0], pt[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    } else if (selectedLocation) {
      map.setView(selectedLocation, 13);
    }
  }, [waypoints, selectedLocation, map]);

  return null;
};

export const OfflineMap: React.FC<OfflineMapProps> = ({
  accidents = [],
  hotspots = [],
  constructionSites = [],
  routeWaypoints = [],
  routeStrategy = 'FASTEST',
  selectedLocation,
  height = '600px'
}) => {
  const [offlineMode, setOfflineMode] = useState<boolean>(true);
  const [showAccidents, setShowAccidents] = useState<boolean>(true);
  const [showHotspots, setShowHotspots] = useState<boolean>(true);
  const [showConstruction, setShowConstruction] = useState<boolean>(true);

  const defaultCenter: [number, number] = selectedLocation || [13.0405, 80.2356];

  const chennaiRoads: { name: string; path: [number, number][] }[] = [
    { name: "Anna Salai (GST Road)", path: [[13.0827, 80.2757], [13.0405, 80.2468], [13.0067, 80.2020], [12.9815, 80.1636], [12.9249, 80.1000]] },
    { name: "OMR (IT Expressway)", path: [[12.9830, 80.2590], [12.9759, 80.2450], [12.9010, 80.2279], [12.8350, 80.2200]] },
    { name: "ECR (East Coast Road)", path: [[12.9830, 80.2590], [12.9200, 80.2550], [12.8500, 80.2480]] },
    { name: "Inner Ring Road (100 Feet Rd)", path: [[13.0694, 80.1948], [13.0500, 80.2121], [13.0067, 80.2020], [12.9759, 80.2206]] },
    { name: "Poonamallee High Road", path: [[13.0827, 80.2757], [13.0720, 80.2100], [13.0550, 80.1500]] }
  ];

  return (
    <div className="relative rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      {/* Map Control Bar Overlay */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-2.5 rounded-xl border border-slate-700/60 shadow-xl">
        <button
          onClick={() => setOfflineMode(!offlineMode)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
            offlineMode
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
          }`}
        >
          {offlineMode ? <WifiOff className="w-3.5 h-3.5" /> : <Wifi className="w-3.5 h-3.5" />}
          {offlineMode ? 'Offline Canvas Mode' : 'OSM Tiles Online'}
        </button>

        <button
          onClick={() => setShowHotspots(!showHotspots)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showHotspots ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Hotspots ({hotspots.length})
        </button>

        <button
          onClick={() => setShowAccidents(!showAccidents)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showAccidents ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Accidents ({accidents.length})
        </button>

        <button
          onClick={() => setShowConstruction(!showConstruction)}
          className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all ${
            showConstruction ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/40' : 'bg-slate-800 text-slate-400'
          }`}
        >
          Construction ({constructionSites.length})
        </button>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={12}
        style={{ height, width: '100%' }}
        scrollWheelZoom={true}
      >
        <MapBoundsFitter waypoints={routeWaypoints} selectedLocation={selectedLocation} />

        {!offlineMode && (
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
        )}

        {/* Offline Road Network Grid */}
        <LayerGroup>
          {chennaiRoads.map((rd, i) => (
            <Polyline
              key={`road-${i}`}
              positions={rd.path}
              pathOptions={{ color: '#334155', weight: 4, opacity: 0.7, dashArray: offlineMode ? '6, 6' : undefined }}
            />
          ))}
        </LayerGroup>

        {/* Hotspot Clusters */}
        {showHotspots &&
          hotspots.map((hs) => (
            <React.Fragment key={`hs-${hs.id}`}>
              <Circle
                center={[hs.latitude, hs.longitude]}
                radius={800}
                pathOptions={{
                  color: hs.risk_level === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                  fillColor: hs.risk_level === 'CRITICAL' ? '#ef4444' : '#f59e0b',
                  fillOpacity: 0.2,
                  weight: 2
                }}
              />
              <Marker
                position={[hs.latitude, hs.longitude]}
                icon={createHotspotIcon(hs.risk_level, hs.hotspot_score)}
              >
                <Popup>
                  <div className="p-1 space-y-2 min-w-[200px]">
                    <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                      <span className="font-extrabold text-sm text-rose-400">Hotspot #{hs.cluster_id}</span>
                      <span className="text-xs px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800">
                        Score: {hs.hotspot_score}/100
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 font-bold">{hs.road_name || 'Chennai Corridor'}</p>
                    <div className="text-xs text-slate-400 space-y-1">
                      <div>Accidents: <span className="text-white font-bold">{hs.accident_count}</span></div>
                      <div>Avg Severity: <span className="text-white font-bold">{hs.severity_score}/5.0</span></div>
                      <div>Status: <span className="text-amber-400 font-bold">{hs.status}</span></div>
                    </div>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          ))}

        {/* Active Construction Sites Layer */}
        {showConstruction &&
          constructionSites.map((cs) => (
            <Marker
              key={`const-${cs.id}`}
              position={[cs.latitude, cs.longitude]}
              icon={createConstructionIcon()}
            >
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[200px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-extrabold text-xs text-yellow-400">Construction Zone</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-950 text-yellow-300 border border-yellow-800">
                      {cs.severity}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{cs.road_name}</p>
                  <p className="text-[11px] text-slate-300">{cs.construction_type}</p>
                  <p className="text-[10px] text-slate-400">Status: <span className="text-emerald-400 font-bold">{cs.status}</span></p>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Individual Accident Markers */}
        {showAccidents &&
          accidents.slice(0, 400).map((acc) => (
            <Marker
              key={`acc-${acc.accident_id}`}
              position={[acc.latitude, acc.longitude]}
              icon={createAccidentIcon(acc.accident_severity)}
            >
              <Popup>
                <div className="p-1 space-y-1.5 min-w-[220px]">
                  <div className="flex items-center justify-between border-b border-slate-700 pb-1">
                    <span className="font-bold text-xs text-cyan-400">{acc.accident_id}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                      {acc.accident_severity}
                    </span>
                  </div>
                  <p className="text-xs font-bold text-white">{acc.road_name}</p>
                  <p className="text-[11px] text-slate-400">{acc.area} • {acc.date} ({acc.time})</p>
                  <div className="grid grid-cols-2 gap-1 text-[10px] bg-slate-900/80 p-1.5 rounded border border-slate-800">
                    <div>Weather: <span className="text-slate-200">{acc.weather}</span></div>
                    <div>Traffic: <span className="text-slate-200">{acc.traffic_level}</span></div>
                    <div>Fatalities: <span className="text-rose-400 font-bold">{acc.fatalities}</span></div>
                    <div>Injuries: <span className="text-amber-400 font-bold">{acc.injuries}</span></div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}

        {/* Selected Route Polyline */}
        {routeWaypoints.length > 0 && (
          <Polyline
            positions={routeWaypoints}
            pathOptions={{
              color: routeStrategy === 'SAFEST' ? '#10b981' : (routeStrategy === 'BALANCED' ? '#f59e0b' : '#ef4444'),
              weight: 6,
              opacity: 0.9,
              dashArray: routeStrategy === 'SAFEST' ? undefined : '8, 8'
            }}
          />
        )}
      </MapContainer>
    </div>
  );
};
