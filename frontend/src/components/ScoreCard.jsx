import React from 'react';

const ScoreCard = ({ title, score, maxScore = 100, icon: Icon, color = 'indigo', subtitle }) => {
  const colorClasses = {
    indigo: 'from-indigo-600 to-purple-600 text-indigo-300 border-indigo-500/30',
    emerald: 'from-emerald-600 to-teal-600 text-emerald-300 border-emerald-500/30',
    amber: 'from-amber-600 to-orange-600 text-amber-300 border-amber-500/30',
    purple: 'from-purple-600 to-pink-600 text-purple-300 border-purple-500/30',
    blue: 'from-blue-600 to-cyan-600 text-blue-300 border-blue-500/30',
  };

  const currentTheme = colorClasses[color] || colorClasses.indigo;
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  return (
    <div className={`bg-slate-800/90 border ${currentTheme.split(' ').pop()} rounded-2xl p-5 shadow-lg relative overflow-hidden flex flex-col justify-between`}>
      <div className="flex justify-between items-start">
        <div>
          <span className="text-xs uppercase font-semibold tracking-wider text-slate-400">{title}</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <span className="text-3xl font-extrabold text-white">{score}</span>
            <span className="text-xs text-slate-500 font-medium">/{maxScore}</span>
          </div>
          {subtitle && <p className="text-[11px] text-slate-400 mt-0.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${currentTheme.split(' ')[0]} ${currentTheme.split(' ')[1]} flex items-center justify-center shadow-md`}>
            <Icon className="w-5 h-5 text-white" />
          </div>
        )}
      </div>

      <div className="w-full bg-slate-900 rounded-full h-2 mt-4 overflow-hidden border border-slate-700/60">
        <div 
          className={`h-full bg-gradient-to-r ${currentTheme.split(' ')[0]} ${currentTheme.split(' ')[1]} transition-all duration-500`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;
