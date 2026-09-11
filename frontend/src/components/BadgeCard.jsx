import React from 'react';

const BadgeCard = ({ name, icon, unlocked = false, unlockedAt }) => {
  return (
    <div
      className={`p-3.5 rounded-2xl border transition-all flex items-center space-x-3.5 card-hover-effect ${
        unlocked
          ? 'bg-white border-[#E58A4E]/40 shadow-xs'
          : 'bg-[#F7F6F2] border-[#E5E3DD] opacity-60 grayscale'
      }`}
    >
      <div
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
          unlocked ? 'bg-[#F8E8DB] text-[#E58A4E] border border-[#E58A4E]/30' : 'bg-[#E5E3DD] text-[#6B6B65]'
        }`}
      >
        {icon || '🏆'}
      </div>
      <div>
        <h4 className={`font-bold text-xs ${unlocked ? 'text-[#171717]' : 'text-[#6B6B65]'}`}>
          {name}
        </h4>
        <p className="text-[10px] text-[#6B6B65] mt-0.5 font-medium">
          {unlocked ? (unlockedAt ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : 'Unlocked Milestone') : 'Locked Milestone'}
        </p>
      </div>
    </div>
  );
};

export default BadgeCard;
