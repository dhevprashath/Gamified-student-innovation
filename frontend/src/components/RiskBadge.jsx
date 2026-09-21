import React from 'react';

const RiskBadge = ({ risk = 'Low' }) => {
  const normalizedRisk = String(risk).trim().toLowerCase();

  if (normalizedRisk === 'high' || normalizedRisk === '🔴 high') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-red-500/15 border border-red-500/30 text-red-600 dark:text-red-400 text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-red-500" />
        <span>High Risk</span>
      </span>
    );
  }

  if (normalizedRisk === 'medium' || normalizedRisk === '🟡 medium') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-amber-500" />
        <span>Medium Risk</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs font-bold shadow-xs">
      <span className="w-2 h-2 rounded-full bg-emerald-500" />
      <span>Low Risk</span>
    </span>
  );
};

export default RiskBadge;
