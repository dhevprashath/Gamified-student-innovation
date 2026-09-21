import React, { useEffect } from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, Trophy, X, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import confetti from 'canvas-confetti';

const ToastContainer = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div className="fixed top-5 right-5 z-[100] flex flex-col space-y-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      <AnimatePresence>
        {toasts.map((toast) => {
          const { id, title, description, type, xpBonus } = toast;

          let Icon = CheckCircle2;
          let iconColor = 'text-primary';
          let borderColor = 'border-primary/30';
          let bgStyle = 'bg-surface';

          if (type === 'achievement') {
            Icon = Trophy;
            iconColor = 'text-reward';
            borderColor = 'border-reward/50';
            bgStyle = 'bg-surface';
          } else if (type === 'error') {
            Icon = AlertCircle;
            iconColor = 'text-danger';
            borderColor = 'border-danger/30';
          } else if (type === 'warning') {
            Icon = AlertTriangle;
            iconColor = 'text-reward';
            borderColor = 'border-reward/40';
          } else if (type === 'info') {
            Icon = Info;
            iconColor = 'text-primary';
            borderColor = 'border-primary/30';
          }

          return (
            <AchievementToast
              key={id}
              id={id}
              title={title}
              description={description}
              type={type}
              xpBonus={xpBonus}
              Icon={Icon}
              iconColor={iconColor}
              borderColor={borderColor}
              bgStyle={bgStyle}
              onDismiss={onDismiss}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
};

const AchievementToast = ({ id, title, description, type, xpBonus, Icon, iconColor, borderColor, bgStyle, onDismiss }) => {
  useEffect(() => {
    if (type === 'achievement') {
      confetti({
        particleCount: 80,
        spread: 55,
        origin: { x: 0.92, y: 0.15 },
        colors: ['#E8862A', '#FFC93C', '#FFE8CF', '#F59E4B', '#FFD25A'],
        gravity: 0.85,
        scalar: 0.9,
      });
    }
  }, [type]);

  return (
    <motion.div
      initial={{ opacity: 0, x: 80, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{   opacity: 0, x: 60, scale: 0.88 }}
      transition={{ type: 'spring', stiffness: 340, damping: 28 }}
      className={`pointer-events-auto flex items-start justify-between p-3.5 rounded-2xl border ${borderColor} ${bgStyle} shadow-warm relative overflow-hidden`}
    >
      {/* Warm glow bar at top for achievement */}
      {type === 'achievement' && (
        <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-reward via-primary to-reward opacity-80" />
      )}

      <div className="flex items-start space-x-3 pr-2">
        <motion.div
          initial={type === 'achievement' ? { scale: 0, rotate: -20 } : { scale: 0 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 18, delay: 0.08 }}
          className="mt-0.5"
        >
          <Icon className={`w-5 h-5 ${iconColor} shrink-0`} />
        </motion.div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-xs font-black text-text">{title}</h4>
            {xpBonus && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 400, damping: 16, delay: 0.15 }}
                className="inline-flex items-center space-x-0.5 px-2 py-0.5 rounded-full bg-reward-soft text-reward-deep text-[10px] font-black"
              >
                <Zap className="w-2.5 h-2.5" />
                <span>+{xpBonus} XP</span>
              </motion.span>
            )}
          </div>
          {description && (
            <p className="text-[11px] text-muted mt-0.5 leading-snug">{description}</p>
          )}
        </div>
      </div>

      <button
        onClick={() => onDismiss(id)}
        className="text-muted hover:text-text p-1 rounded-lg transition-colors shrink-0 cursor-pointer"
        aria-label="Dismiss"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </motion.div>
  );
};

export default ToastContainer;
