import React from 'react';

const ProgressBar = ({ label, value, max = 100, color = 'orange', showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const fillClass = 'bg-[#E58A4E]';
  const trackClass = 'bg-[#F8E8DB]';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-[#171717]">{label}</span>
        {showPercentage && <span className="text-[#6B6B65] font-medium">{Math.round(percentage)}%</span>}
      </div>
      <div className={`w-full ${trackClass} rounded-full h-2.5 overflow-hidden`}>
        <div
          className={`${fillClass} h-full rounded-full transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
