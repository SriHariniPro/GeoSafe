import React, { useState, useEffect } from 'react';
import { Navbar } from './components/common/Navbar';
import { Sidebar } from './components/common/Sidebar';

import { LandingPage } from './pages/LandingPage';
import { UserDashboard } from './pages/UserDashboard';
import { SafetyMap } from './pages/SafetyMap';
import { HotspotIntelligence } from './pages/HotspotIntelligence';
import { RiskPrediction } from './pages/RiskPrediction';
import { WhatIfSimulator } from './pages/WhatIfSimulator';
import { RouteSafety } from './pages/RouteSafety';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { EDAExplorer } from './pages/EDAExplorer';
import { ModelPerformancePage } from './pages/ModelPerformance';
import { DataManagement } from './pages/DataManagement';
import { AboutPage } from './pages/AboutPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

import { getDashboardSummary } from './services/api';
import { User, DashboardSummary } from './types';

export const App: React.FC = () => {
  const [currentTab, setCurrentTab] = useState<string>('landing');
  const [user, setUser] = useState<User | null>({
    id: 1,
    name: 'Authority Admin',
    email: 'admin@geosafe.local',
    role: 'admin',
    created_at: new Date().toISOString()
  });
  const [token, setToken] = useState<string | null>('demo-token');
  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  useEffect(() => {
    getDashboardSummary()
      .then(setSummary)
      .catch(err => console.error('Initial summary fetch error:', err));
  }, []);

  const handleLoginSuccess = (userData: User, authToken: string) => {
    setUser(userData);
    setToken(authToken);
    setCurrentTab(userData.role === 'admin' ? 'authority' : 'dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setToken(null);
    setCurrentTab('landing');
  };

  const handleGlobalSearch = (term: string) => {
    setCurrentTab('map');
  };

  const renderActiveTab = () => {
    switch (currentTab) {
      case 'landing':
        return <LandingPage summary={summary} onExplore={(tab) => setCurrentTab(tab)} />;
      case 'dashboard':
        return <UserDashboard />;
      case 'map':
        return <SafetyMap />;
      case 'hotspots':
        return <HotspotIntelligence />;
      case 'risk':
        return <RiskPrediction />;
      case 'simulator':
        return <WhatIfSimulator />;
      case 'routes':
        return <RouteSafety />;
      case 'authority':
        return <AuthorityDashboard currentUser={user} />;
      case 'eda':
        return <EDAExplorer />;
      case 'model':
        return <ModelPerformancePage />;
      case 'data':
        return <DataManagement />;
      case 'about':
        return <AboutPage />;
      case 'login':
        return <LoginPage onLoginSuccess={handleLoginSuccess} onNavigateRegister={() => setCurrentTab('register')} />;
      case 'register':
        return <RegisterPage onRegisterSuccess={handleLoginSuccess} onNavigateLogin={() => setCurrentTab('login')} />;
      default:
        return <UserDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex flex-col font-sans">
      <Navbar user={user} onLogout={handleLogout} onSearch={handleGlobalSearch} />

      <div className="flex flex-1">
        <Sidebar
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          userRole={user?.role || 'user'}
        />

        <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto overflow-y-auto">
          {renderActiveTab()}
        </main>
      </div>
    </div>
  );
};

export default App;
