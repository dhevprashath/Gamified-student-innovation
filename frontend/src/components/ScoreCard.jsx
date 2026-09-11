import React from 'react';
import AnimatedNumber from './AnimatedNumber';

const ScoreCard = ({ title, score, maxScore = 100, icon: Icon, color = 'orange', subtitle }) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  const barColor = 'bg-[#E58A4E]';
  const trackColor = 'bg-[#F8E8DB]';
  const iconBg = 'bg-[#F8E8DB] text-[#E58A4E]';

  return (
    <div className="bg-white border border-[#E5E3DD] rounded-2xl p-5 shadow-xs card-hover-effect flex flex-col justify-between">
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#6B6B65]">{title}</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <AnimatedNumber value={score} className="text-3xl font-black text-[#171717]" />
            <span className="text-xs text-[#6B6B65] font-semibold">/{maxScore}</span>
          </div>
          {subtitle && <p className="text-[11px] text-[#6B6B65] mt-0.5">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className={`w-full ${trackColor} rounded-full h-2 mt-4 overflow-hidden`}>
        <div
          className={`h-full ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};

export default ScoreCard;
