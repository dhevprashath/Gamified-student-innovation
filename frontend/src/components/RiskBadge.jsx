import React from 'react';

const RiskBadge = ({ risk = 'Low' }) => {
  const normalizedRisk = String(risk).trim().toLowerCase();

  if (normalizedRisk === 'high' || normalizedRisk === '🔴 high') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-danger/15 border border-danger/40 text-danger text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-danger" />
        <span>High Risk</span>
      </span>
    );
  }

  if (normalizedRisk === 'medium' || normalizedRisk === '🟡 medium') {
    return (
      <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-primary-soft border border-primary/50 text-primary-deep text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-primary-deep" />
        <span>Medium Risk</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-sage-soft border border-sage/60 text-sage-deep text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-sage-deep" />
      <span>Low Risk</span>
    </span>
  );
};

export default RiskBadge;
