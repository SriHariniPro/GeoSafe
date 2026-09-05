import React, { useEffect, useState } from 'react';
import { 
  AlertTriangle, Shield, Flame, Activity, Users, FileSpreadsheet, 
  Sparkles, BarChart2, PieChart, TrendingUp 
} from 'lucide-react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  PieChart as RePieChart, Pie, Cell, LineChart, Line, Legend 
} from 'recharts';
import { StatCard } from '../components/common/StatCard';
import { getDashboardSummary, getEDAData } from '../services/api';
import { DashboardSummary, EDASummary } from '../types';

export const UserDashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [eda, setEDA] = useState<EDASummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [sumData, edaData] = await Promise.all([
          getDashboardSummary(),
          getEDAData()
        ]);
        setSummary(sumData);
        setEDA(edaData);
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading || !summary || !eda) {
    return (
      <div className="py-20 text-center text-slate-400 font-bold animate-pulse">
        Loading GeoSafe Safety Analytics & Intelligence...
      </div>
    );
  }

  // Chart datasets
  const monthData = Object.entries(eda.accidents_by_month).map(([month, count]) => ({ month, count }));
  const hourData = Object.entries(eda.accidents_by_hour).map(([hour, count]) => ({ hour, count }));
  const dayData = Object.entries(eda.accidents_by_day).map(([day, count]) => ({ day, count }));

  const COLORS = ['#10b981', '#f59e0b', '#f97316', '#ef4444', '#8b5cf6'];
  const severityData = Object.entries(eda.severity_distribution).map(([name, value]) => ({ name, value }));
  const weatherData = Object.entries(eda.weather_distribution).map(([name, value]) => ({ name, value }));
  const trafficData = Object.entries(eda.traffic_distribution).map(([name, value]) => ({ name, value }));
  const roadTypeData = Object.entries(eda.road_type_distribution).map(([name, value]) => ({ name, value }));
  const constructionData = Object.entries(eda.construction_distribution).map(([name, value]) => ({ name, value: value }));

  return (
    <div className="space-y-8">
      {/* Top Header & Dynamic Safety Insight Panel */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
            <Activity className="w-6 h-6 text-cyan-400" /> Chennai Road Safety Intelligence Dashboard
          </h2>
          <p className="text-xs text-slate-400">Real-time risk metrics and spatiotemporal accident distributions</p>
        </div>
      </div>

      {/* Dynamic Today's Safety Insight Panel */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-cyan-950/80 via-navy-900 to-navy-850 border border-cyan-500/40 shadow-xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 rounded-xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/40 shrink-0">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="space-y-1">
            <span className="text-xs font-black uppercase tracking-wider text-cyan-400">Today's AI Safety Insight</span>
            <p className="text-sm font-semibold text-slate-200 leading-relaxed">
              "{summary.todays_safety_insight}"
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-4">
        <StatCard
          title="Total Accidents"
          value={summary.total_accidents}
          subtitle="Primary Dataset Records"
          icon={FileSpreadsheet}
          color="indigo"
        />
        <StatCard
          title="High Risk Zones"
          value={summary.high_risk_accidents}
          subtitle="Severe & Fatal Incidents"
          icon={AlertTriangle}
          color="rose"
        />
        <StatCard
          title="Detected Hotspots"
          value={summary.detected_hotspots}
          subtitle="DBSCAN Spatial Clusters"
          icon={Flame}
          color="amber"
        />
        <StatCard
          title="Total Fatalities"
          value={summary.total_fatalities}
          subtitle="Recorded Casualties"
          icon={Users}
          color="rose"
        />
        <StatCard
          title="Total Injuries"
          value={summary.total_injuries}
          subtitle="Medical Emergency Reports"
          icon={Activity}
          color="amber"
        />
        <StatCard
          title="Average Risk Score"
          value={`${summary.average_risk_score}/100`}
          subtitle="Citywide Safety Baseline"
          icon={Shield}
          color="cyan"
        />
      </div>

      {/* 8 Required Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. Accidents by Month */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>1. Accidents by Month</span>
            <TrendingUp className="w-4 h-4 text-cyan-400" />
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthData}>
                <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Line type="monotone" dataKey="count" stroke="#38bdf8" strokeWidth={3} dot={{ fill: '#38bdf8' }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Accidents by Hour */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white flex items-center justify-between">
            <span>2. Accidents by Hour of Day</span>
            <BarChart2 className="w-4 h-4 text-amber-400" />
          </h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourData}>
                <XAxis dataKey="hour" stroke="#64748b" fontSize={10} interval={2} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="count" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 3. Accidents by Day of Week */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">3. Accidents by Day of Week</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dayData}>
                <XAxis dataKey="day" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="count" fill="#10b981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 4. Severity Distribution */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">4. Accident Severity Distribution</h3>
          <div className="h-60 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <RePieChart>
                <Pie data={severityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                  {severityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Legend />
              </RePieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Weather vs Accidents */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">5. Weather Condition Impact</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weatherData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="value" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 6. Traffic Level vs Accidents */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">6. Traffic Level vs Accidents</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={trafficData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="value" fill="#f97316" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7. Road Type vs Accidents */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">7. Road Classification Distribution</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={roadTypeData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="value" fill="#06b6d4" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 8. Construction vs Accidents */}
        <div className="p-5 rounded-2xl bg-navy-900 border border-navy-700/60 shadow-lg space-y-3">
          <h3 className="text-sm font-bold text-white">8. Construction Zone Correlation</h3>
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={constructionData}>
                <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip contentStyle={{ backgroundColor: '#0f182e', borderColor: '#1e293b' }} />
                <Bar dataKey="value" fill="#eab308" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
