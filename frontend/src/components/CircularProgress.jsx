import React, { useEffect, useState } from 'react';
import AnimatedNumber from './AnimatedNumber';

const CircularProgress = ({
  score = 0,
  maxScore = 100,
  size = 96,
  strokeWidth = 8,
  label = 'Score',
  color = 'primary',
  sublabel = '',
}) => {
  const [animatedOffset, setAnimatedOffset] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const targetPercentage = Math.min(100, Math.max(0, (score / maxScore) * 100));

  useEffect(() => {
    const timer = setTimeout(() => {
      const offset = circumference - (circumference * targetPercentage) / 100;
      setAnimatedOffset(offset);
    }, 100);

    return () => clearTimeout(timer);
  }, [score, maxScore, circumference, targetPercentage]);

  const isReward = color === 'reward' || color === 'amber';
  const strokeColor = isReward ? 'var(--reward)' : 'var(--primary)';
  const trackColor = isReward ? 'var(--reward-soft)' : 'var(--primary-soft)';

  return (
    <div className="flex items-center space-x-4">
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={trackColor}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={animatedOffset === 0 ? circumference : animatedOffset}
            strokeLinecap="round"
            fill="transparent"
            style={{ transition: 'stroke-dashoffset 1000ms cubic-bezier(0.16, 1, 0.3, 1)' }}
          />
        </svg>
        <div className="absolute flex flex-col items-center justify-center text-center">
          <AnimatedNumber
            value={score}
            duration={1000}
            className="text-xl font-black text-text"
          />
          <span className="text-[9px] font-bold text-muted uppercase tracking-wider">/{maxScore}</span>
        </div>
      </div>

      <div>
        <div className="text-xs font-bold text-text">{label}</div>
        {sublabel && <div className="text-[11px] text-muted mt-0.5">{sublabel}</div>}
      </div>
    </div>
  );
};

export default CircularProgress;
