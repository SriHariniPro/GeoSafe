import React from 'react';
import { 
  LayoutDashboard, Map, Flame, BrainCircuit, Sliders, Navigation, 
  BarChart3, ShieldAlert, Cpu, Database, Info, Settings 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  onTabChange: (tab: string) => void;
  userRole?: string;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, onTabChange, userRole = 'user' }) => {
  const mainNav = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'map', label: 'Safety Map', icon: Map },
    { id: 'hotspots', label: 'Hotspot Intelligence', icon: Flame },
    { id: 'risk', label: 'Risk Prediction', icon: BrainCircuit },
    { id: 'simulator', label: 'What-If Simulator', icon: Sliders },
    { id: 'routes', label: 'Route Safety', icon: Navigation },
    { id: 'eda', label: 'EDA Explorer', icon: BarChart3 },
  ];

  const authorityNav = [
    { id: 'authority', label: 'Intervention Dashboard', icon: ShieldAlert },
    { id: 'model', label: 'Model Performance', icon: Cpu },
    { id: 'data', label: 'Data Management', icon: Database },
  ];

  const systemNav = [
    { id: 'about', label: 'About GeoSafe', icon: Info },
  ];

  const renderGroup = (title: string, items: typeof mainNav) => (
    <div className="mb-6">
      <h3 className="px-3 text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">{title}</h3>
      <div className="space-y-1">
        {items.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold transition-all ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <aside className="w-64 bg-navy-900 border-r border-navy-700/60 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div>
        {renderGroup('Overview & Intelligence', mainNav)}
        {renderGroup('Authority Decision Support', authorityNav)}
        {renderGroup('System & Docs', systemNav)}
      </div>

      <div className="p-3 rounded-xl bg-navy-850 border border-navy-700 text-center">
        <p className="text-[11px] font-bold text-slate-300">GeoSafe v1.0.0</p>
        <p className="text-[9px] text-slate-500 mt-0.5">Chennai Spatiotemporal AI</p>
      </div>
    </aside>
  );
};
