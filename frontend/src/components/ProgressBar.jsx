import React from 'react';
import { motion } from 'framer-motion';
import AnimatedNumber from './AnimatedNumber';

const ProgressBar = ({ label, value, max = 100, color = 'primary', showPercentage = true }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));

  const isReward = color === 'reward' || color === 'amber';
  const fillClass = isReward ? 'bg-reward' : 'bg-primary';
  const trackClass = isReward ? 'bg-reward-soft' : 'bg-primary-soft';

  return (
    <div className="space-y-1.5">
      <div className="flex justify-between items-center text-xs font-semibold">
        <span className="text-text">{label}</span>
        {showPercentage && (
          <span className="text-muted font-medium">
            <AnimatedNumber value={Math.round(percentage)} suffix="%" duration={900} />
          </span>
        )}
      </div>
      <div className={`w-full ${trackClass} rounded-full h-2.5 overflow-hidden`}>
        <motion.div
          className={`${fillClass} h-full rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1], delay: 0.08 }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;