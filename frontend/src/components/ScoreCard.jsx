import React from 'react';
import AnimatedNumber from './AnimatedNumber';
import { motion } from 'framer-motion';

const ScoreCard = ({ title, score, maxScore = 100, icon: Icon, color = 'primary', subtitle }) => {
  const percentage = Math.min(100, Math.max(0, (score / maxScore) * 100));
  const isReward = color === 'reward' || color === 'amber';
  const barColor   = isReward ? 'bg-reward'      : 'bg-primary';
  const trackColor = isReward ? 'bg-reward-soft' : 'bg-primary-soft';
  const iconBg     = isReward ? 'bg-reward-soft text-reward' : 'bg-primary-soft text-primary';

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: 'var(--shadow-warm-hover)' }}
      whileTap={{ scale: 0.98 }}
      className="bg-surface border border-border rounded-2xl p-5 card-hover-effect flex flex-col justify-between"
    >
      <div className="flex justify-between items-start">
        <div>
          <span className="text-[11px] uppercase font-black tracking-wider text-muted">{title}</span>
          <div className="flex items-baseline space-x-1 mt-1">
            <AnimatedNumber value={score} className="text-3xl font-black text-text" />
            <span className="text-xs text-muted font-bold">/{maxScore}</span>
          </div>
          {subtitle && <p className="text-[11px] text-muted mt-0.5">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center shadow-warm`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      <div className={`w-full ${trackColor} rounded-full h-2.5 mt-4 overflow-hidden`}>
        <motion.div
          className={`h-full ${barColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.1 }}
        />
      </div>
    </motion.div>
  );
};

export default ScoreCard;
