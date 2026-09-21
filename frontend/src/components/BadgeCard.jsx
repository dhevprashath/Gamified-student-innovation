import React from 'react';
import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';

const BadgeCard = ({ name, icon, unlocked = false, unlockedAt }) => {
  return (
    <motion.div
      whileHover={unlocked ? { y: -3, scale: 1.02 } : { scale: 1.01 }}
      whileTap={{ scale: 0.97 }}
      className={`p-3.5 rounded-2xl border transition-all flex items-center space-x-3.5 card-hover-effect ${
        unlocked
          ? 'bg-surface border-reward/40'
          : 'bg-bg border-border opacity-60 grayscale'
      }`}
    >
      <motion.div
        initial={false}
        animate={unlocked ? { scale: [1, 1.2, 0.9, 1.05, 1] } : {}}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
        className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
          unlocked ? 'bg-reward-soft text-reward border border-reward/30' : 'bg-border text-muted'
        }`}
      >
        {unlocked ? (icon || '🏆') : <Lock className="w-4 h-4" />}
      </motion.div>
      <div>
        <h4 className={`font-bold text-xs ${unlocked ? 'text-text' : 'text-muted'}`}>
          {name}
        </h4>
        <p className="text-[10px] text-muted mt-0.5 font-medium">
          {unlocked
            ? (unlockedAt ? `Unlocked ${new Date(unlockedAt).toLocaleDateString()}` : 'Unlocked Milestone')
            : 'Locked Milestone'}
        </p>
      </div>
    </motion.div>
  );
};

export default BadgeCard;
