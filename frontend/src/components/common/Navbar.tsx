import React, { useState } from 'react';
import { Search, Shield, User as UserIcon, LogOut, Bell, Compass } from 'lucide-react';
import { User } from '../../types';

interface NavbarProps {
  user: User | null;
  onLogout: () => void;
  onSearch: (term: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({ user, onLogout, onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearch(searchTerm);
    }
  };

  return (
    <header className="h-16 bg-navy-900/90 backdrop-blur-md border-b border-navy-700/60 sticky top-0 z-40 px-6 flex items-center justify-between">
      {/* Title & Brand */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 shadow-lg shadow-cyan-500/20">
          <Shield className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-lg font-black text-white tracking-wider flex items-center gap-2">
            GeoSafe <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">Chennai AI</span>
          </h1>
          <p className="text-[10px] text-slate-400 font-medium">Explainable Spatiotemporal Safety Intelligence</p>
        </div>
      </div>

      {/* Global Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative hidden md:flex items-center w-96">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search road, area, accident ID, or hotspot..."
          className="w-full pl-10 pr-4 py-2 text-xs rounded-xl bg-navy-800 border border-navy-700 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all"
        />
      </form>

      {/* User Controls */}
      <div className="flex items-center gap-4">
        {user ? (
          <div className="flex items-center gap-3">
            <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full uppercase border ${
              user.role === 'admin' 
                ? 'bg-rose-950/80 text-rose-400 border-rose-800' 
                : 'bg-emerald-950/80 text-emerald-400 border-emerald-800'
            }`}>
              {user.role === 'admin' ? 'Authority Admin' : 'User View'}
            </span>
            <div className="flex items-center gap-2 bg-navy-800/80 px-3 py-1.5 rounded-xl border border-navy-700">
              <UserIcon className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-bold text-slate-200">{user.name}</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-2 rounded-xl bg-navy-800 text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 border border-navy-700 transition-all"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <a
            href="#login"
            className="text-xs font-bold px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all shadow-md shadow-cyan-600/20"
          >
            Sign In
          </a>
        )}
      </div>
    </header>
  );
};
