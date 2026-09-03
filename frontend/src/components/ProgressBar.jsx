import React from 'react';

const ProgressBar = ({ label, value, max = 100, color = 'indigo', showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  const colors = {
    indigo: 'from-indigo-500 to-purple-500',
    teal: 'from-teal-500 to-emerald-500',
    amber: 'from-amber-500 to-yellow-500',
    purple: 'from-purple-500 to-pink-500',
    blue: 'from-blue-500 to-cyan-500',
  };

  const gradientClass = colors[color] || colors.indigo;

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-slate-300">{label}</span>
        {showPercentage && <span className="text-slate-400">{Math.round(percentage)}%</span>}
      </div>
      <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden border border-slate-700/60">
        <div 
          className={`bg-gradient-to-r ${gradientClass} h-full rounded-full transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
