import React from 'react';

interface RiskBadgeProps {
  level: string;
  score?: number;
  size?: 'sm' | 'md' | 'lg';
}

export const RiskBadge: React.FC<RiskBadgeProps> = ({ level, score, size = 'md' }) => {
  const normLevel = (level || '').toUpperCase();

  let colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
  if (normLevel.includes('CRITICAL') || normLevel.includes('VERY HIGH')) {
    colorClasses = 'bg-rose-950/80 text-rose-400 border-rose-800/60 animate-pulse';
  } else if (normLevel.includes('HIGH')) {
    colorClasses = 'bg-amber-950/80 text-amber-400 border-amber-800/60';
  } else if (normLevel.includes('MEDIUM') || normLevel.includes('MODERATE')) {
    colorClasses = 'bg-yellow-950/80 text-yellow-300 border-yellow-800/60';
  } else if (normLevel.includes('LOW') || normLevel.includes('SAFE')) {
    colorClasses = 'bg-emerald-950/80 text-emerald-400 border-emerald-800/60';
  }

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs font-semibold',
    md: 'px-2.5 py-1 text-xs font-bold',
    lg: 'px-3.5 py-1.5 text-sm font-extrabold',
  }[size];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border shadow-sm ${colorClasses} ${sizeClasses}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
      {normLevel}
      {score !== undefined && <span className="opacity-80">({score})</span>}
    </span>
  );
};
