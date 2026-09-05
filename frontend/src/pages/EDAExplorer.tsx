import React, { useEffect, useState } from 'react';
import { BarChart3, Sparkles, Filter, Database, FileSpreadsheet } from 'lucide-react';
import { getEDAData } from '../services/api';
import { EDASummary } from '../types';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';

export const EDAExplorer: React.FC = () => {
  const [eda, setEDA] = useState<EDASummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEDAData().then(setEDA).finally(() => setLoading(false));
  }, []);

  if (loading || !eda) {
    return <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading Exploratory Data Analysis...</div>;
  }

  const hourData = Object.entries(eda.accidents_by_hour).map(([hour, count]) => ({ hour, count }));
  const dayData = Object.entries(eda.accidents_by_day).map(([day, count]) => ({ day, count }));
  const monthData = Object.entries(eda.accidents_by_month).map(([month, count]) => ({ month, count }));

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-cyan-400" /> Exploratory Data Analytics (EDA) & Data Insights
        </h2>
        <p className="text-xs text-slate-400">Statistical distribution metrics derived from primary accident records</p>
      </div>

      {/* Automated Data Insights Panel */}
      <div className="p-6 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-xl space-y-3">
        <h3 className="text-sm font-bold text-white flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-cyan-400" /> Automatically Derived Data Insights
        </h3>
        <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {eda.observations.map((obs, i) => (
            <li key={`obs-${i}`} className="p-3 rounded-xl bg-navy-850 border border-navy-750 text-xs text-slate-200 font-semibold leading-relaxed flex items-start gap-2">
              <span className="text-cyan-400 font-bold">•</span> {obs}
            </li>
          ))}
        </ul>
      </div>

      {/* Distribution Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 space-y-3">
          <h3 className="text-sm font-bold text-white">Accidents by Hour of Day</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="count" fill="#38bdf8" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 space-y-3">
          <h3 className="text-sm font-bold text-white">Accidents by Day of Week</h3>
          <div className="h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
