import React from 'react';

const RiskBadge = ({ risk = 'Low' }) => {
  const normalizedRisk = String(risk).trim().toLowerCase();

  if (normalizedRisk === 'high' || normalizedRisk === '🔴 high') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-red-50 border border-red-200 text-red-700 text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-red-600" />
        <span>High Risk</span>
      </span>
    );
  }

  if (normalizedRisk === 'medium' || normalizedRisk === '🟡 medium') {
    return (
      <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#F8E8DB] border border-[#E58A4E]/30 text-[#E58A4E] text-xs font-bold shadow-xs">
        <span className="w-2 h-2 rounded-full bg-[#E58A4E]" />
        <span>Medium Risk</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center space-x-1 px-3 py-1 rounded-full bg-[#F8E8DB] border border-[#E58A4E]/20 text-[#E58A4E] text-xs font-bold shadow-xs">
      <span className="w-2 h-2 rounded-full bg-[#E58A4E]" />
      <span>Low Risk</span>
    </span>
  );
};

export default RiskBadge;
