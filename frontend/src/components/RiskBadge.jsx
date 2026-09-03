import React from 'react';

const RiskBadge = ({ risk = 'Low' }) => {
  const normalizedRisk = String(risk).trim().toLowerCase();

  if (normalizedRisk === 'high' || normalizedRisk === '🔴 high') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-950/80 border border-red-800 text-red-300 text-xs font-bold shadow">
        <span>🔴</span>
        <span>High Risk</span>
      </span>
    );
  }

  if (normalizedRisk === 'medium' || normalizedRisk === '🟡 medium') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold shadow">
        <span>🟡</span>
        <span>Medium Risk</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold shadow">
      <span>🟢</span>
      <span>Low Risk</span>
    </span>
  );
};

export default RiskBadge;
