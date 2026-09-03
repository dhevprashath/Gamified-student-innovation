import React from 'react';

const BadgeCard = ({ name, icon, unlocked = false, unlockedAt }) => {
  return (
    <div 
      className={`p-4 rounded-xl border transition-all flex items-center space-x-3.5 ${
        unlocked 
          ? 'bg-gradient-to-r from-amber-950/40 via-slate-800 to-slate-900 border-amber-500/50 shadow-lg shadow-amber-900/10' 
          : 'bg-slate-900/40 border-slate-800 opacity-50 grayscale'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0 ${
        unlocked ? 'bg-amber-950/80 border border-amber-600/50 text-amber-300' : 'bg-slate-800 border border-slate-700'
      }`}>
        {icon || '🏆'}
      </div>
      <div>
        <h4 className={`font-bold text-xs ${unlocked ? 'text-amber-200' : 'text-slate-400'}`}>
          {name}
        </h4>
        <p className="text-[10px] text-slate-500 mt-0.5">
          {unlocked ? (unlockedAt ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : 'Unlocked') : 'Locked Milestone'}
        </p>
      </div>
    </div>
  );
};

export default BadgeCard;
