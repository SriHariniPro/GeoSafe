import React, { useState } from 'react';
import { BrainCircuit, Sparkles, AlertCircle, ArrowRight, ShieldCheck, CheckCircle2, MapPin } from 'lucide-react';
import { predictRisk } from '../services/api';
import { RiskPredictionResponse, LocationItem } from '../types';
import { RiskBadge } from '../components/common/RiskBadge';
import { LocationAutocomplete } from '../components/common/LocationAutocomplete';

export const RiskPrediction: React.FC = () => {
  const [roadName, setRoadName] = useState('Anna Salai');
  const [area, setArea] = useState('Teynampet');
  const [selectedLocObj, setSelectedLocObj] = useState<LocationItem | null>(null);

  const [time, setTime] = useState('18:30');
  const [dayOfWeek, setDayOfWeek] = useState('Friday');
  const [weather, setWeather] = useState('Rain');
  const [trafficLevel, setTrafficLevel] = useState('Heavy');
  const [roadType, setRoadType] = useState('Arterial');
  const [speedLimit, setSpeedLimit] = useState(60);
  const [construction, setConstruction] = useState('Yes');
  const [visibility, setVisibility] = useState(2.0);

  const [prediction, setPrediction] = useState<RiskPredictionResponse | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLocationSelect = (val: string, item?: LocationItem) => {
    setRoadName(val);
    if (item) {
      setArea(item.area);
      setSelectedLocObj(item);
    }
  };

  const handlePredict = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setLoading(true);
    try {
      const res = await predictRisk({
        road_name: roadName,
        area: area,
        latitude: selectedLocObj?.latitude,
        longitude: selectedLocObj?.longitude,
        time,
        day_of_week: dayOfWeek,
        weather,
        traffic_level: trafficLevel,
        road_type: roadType,
        speed_limit: speedLimit,
        construction,
        visibility
      });
      setPrediction(res);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.detail || 'Location not found in GeoSafe dataset. Please select a location from the suggestions.');
      setPrediction(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BrainCircuit className="w-6 h-6 text-cyan-400" /> Random Forest Predictive Risk & Explainable AI (XAI)
        </h2>
        <p className="text-xs text-slate-400">Search Chennai road corridors & predict context-aware safety risk ratings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Query Inputs */}
        <form onSubmit={handlePredict} className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
          <h3 className="text-sm font-bold text-white mb-2">Scenario Query Parameters</h3>

          {/* Location Autocomplete Input */}
          <LocationAutocomplete
            label="Search Road Corridor or Area"
            placeholder="Type Anna Salai, T Nagar, OMR, etc..."
            value={roadName}
            onChange={handleLocationSelect}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Time of Day</label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Day of Week</label>
              <select
                value={dayOfWeek}
                onChange={(e) => setDayOfWeek(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              >
                {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Weather</label>
              <select
                value={weather}
                onChange={(e) => setWeather(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              >
                {['Clear', 'Cloudy', 'Fog/Mist', 'Rain', 'Heavy Rain'].map(w => (
                  <option key={w} value={w}>{w}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Traffic Level</label>
              <select
                value={trafficLevel}
                onChange={(e) => setTrafficLevel(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              >
                {['Low', 'Medium', 'High', 'Heavy', 'Congested'].map(t => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Road Type</label>
              <select
                value={roadType}
                onChange={(e) => setRoadType(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              >
                {['Local', 'Collector', 'Arterial', 'Expressway/Highway'].map(r => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Speed Limit (km/h)</label>
              <input
                type="number"
                value={speedLimit}
                onChange={(e) => setSpeedLimit(parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Construction Zone</label>
              <select
                value={construction}
                onChange={(e) => setConstruction(e.target.value)}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              >
                <option value="No">No</option>
                <option value="Yes">Yes</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-slate-400 uppercase block mb-1">Visibility (km)</label>
              <input
                type="number"
                step="0.5"
                value={visibility}
                onChange={(e) => setVisibility(parseFloat(e.target.value))}
                className="w-full px-3 py-2 bg-navy-800 border border-navy-700 rounded-xl text-xs text-white"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-cyan-600/30 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Resolving & Evaluating...' : 'Calculate Predicted Risk'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Prediction Results & XAI Output */}
        <div className="lg:col-span-2 space-y-6">
          {errorMsg && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800 text-rose-300 text-xs font-bold flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {prediction ? (
            <>
              {/* Resolved Location & Risk Score Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-navy-900 to-navy-850 border border-navy-700 shadow-xl space-y-4">
                <div className="flex items-center gap-2 text-xs font-bold text-cyan-400 border-b border-navy-750 pb-2">
                  <MapPin className="w-4 h-4" /> Resolved Dataset Location: <span className="text-white">{prediction.resolved_location}</span>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-1">Predicted Road Risk Score</span>
                    <div className="text-5xl font-black text-white flex items-baseline gap-2">
                      {prediction.risk_score} <span className="text-lg text-slate-400 font-normal">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-400 mt-2">
                      Model Confidence: <span className="text-cyan-400 font-bold">{prediction.confidence}%</span>
                    </p>
                  </div>
                  <div>
                    <RiskBadge level={prediction.risk_level} size="lg" />
                  </div>
                </div>
              </div>

              {/* Dynamic Horizontal XAI Bar Chart */}
              <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-4">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-cyan-400" /> Explainable AI (XAI) Feature Attribution Breakdown
                </h3>

                <div className="space-y-3">
                  {prediction.explanations.map((exp, i) => (
                    <div key={`exp-${i}`} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <span className="text-slate-200">{exp.feature}</span>
                        <span className="text-cyan-400 font-bold">{exp.percentage}%</span>
                      </div>
                      <div className="w-full h-2.5 bg-navy-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all duration-500"
                          style={{ width: `${exp.percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Why Risky & Reduction Suggestions */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-5 rounded-2xl bg-navy-900 border border-rose-900/40 shadow-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4" /> Why is this area risky?
                  </h4>
                  <ul className="space-y-2">
                    {prediction.why_risky.map((reason, idx) => (
                      <li key={`why-${idx}`} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <span className="text-rose-400 font-bold">•</span> {reason}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="p-5 rounded-2xl bg-navy-900 border border-emerald-900/40 shadow-lg space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4" /> How can risk be reduced?
                  </h4>
                  <ul className="space-y-2">
                    {prediction.reduction_suggestions.map((sug, idx) => (
                      <li key={`sug-${idx}`} className="text-xs text-slate-300 leading-relaxed flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" /> {sug}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </>
          ) : (
            <div className="p-12 rounded-2xl bg-navy-900/60 border border-navy-700/60 text-center space-y-3">
              <BrainCircuit className="w-12 h-12 text-slate-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-300">Run Location-Aware Risk Prediction</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Type and select a location from the autocomplete field on the left, adjust environmental scenario settings, and click "Calculate Predicted Risk".
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
