import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, Zap, RefreshCw, Award } from 'lucide-react';
import { motion } from 'framer-motion';
import JourneyTimeline from '../components/JourneyTimeline';
import BadgeCard from '../components/BadgeCard';
import ProgressBar from '../components/ProgressBar';
import AnimatedNumber from '../components/AnimatedNumber';
import { JourneySkeleton } from '../components/SkeletonLoader';
import { getJourneyProgress, completeJourneyStage } from '../services/api';
import { useToast } from '../context/ToastContext';

const ALL_BADGES_DEFINITIONS = [
  { name: '💡 Idea Starter', icon: '💡' },
  { name: '🔬 Research Explorer', icon: '🔬' },
  { name: '🎯 Validator', icon: '🎯' },
  { name: '👥 Team Builder', icon: '👥' },
  { name: '🛠️ Prototype Builder', icon: '🛠️' },
  { name: '🧪 Testing Master', icon: '🧪' },
  { name: '🚀 Innovation Champion', icon: '🚀' },
];

const InnovationJourney = ({ activeProject }) => {
  const { addToast } = useToast();
  const [journeyData, setJourneyData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [completingStage, setCompletingStage] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadJourney(activeProject.id);
    }
  }, [activeProject]);

  const loadJourney = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await getJourneyProgress(projectId);
      setJourneyData(data);
    } catch (err) {
      setError('Failed to load journey progress.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteStage = async (stageName, xpReward) => {
    if (!activeProject?.id) return;
    setCompletingStage(stageName);
    try {
      const updated = await completeJourneyStage(activeProject.id, stageName);
      setJourneyData(updated);

      addToast({
        title: `Milestone Completed — ${stageName} Stage!`,
        description: `Unlocked +${xpReward} XP for advancing project milestones.`,
        type: 'achievement',
        xpBonus: xpReward
      });
    } catch (err) {
      console.error('Failed to complete stage:', err);
    } finally {
      setCompletingStage(null);
    }
  };

  const level = journeyData?.current_level || 1;
  const totalXp = journeyData?.total_xp || 0;
  const xpForNextLevel = journeyData?.xp_for_next_level || 200;
  const baseLevelXp = (level - 1) * 200;
  const levelProgressPercentage = Math.min(100, Math.max(0, ((totalXp - baseLevelXp) / 200) * 100));

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-reward-soft text-reward-deep text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Module 3 — Gamified Innovation Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text">Innovation Journey Roadmap</h1>
            <p className="text-muted text-sm mt-1">
              Advance your project through 7 incubation stages, earn XP rewards, level up, and collect innovation badges.
            </p>
          </div>

          <button
            onClick={() => loadJourney(activeProject?.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-bg border border-border hover:bg-border text-text rounded-xl text-xs font-bold transition-colors shrink-0 self-start md:self-auto cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-primary" />
            <span>Refresh Journey</span>
          </button>
        </div>
      </div>

      {loading ? (
        <JourneySkeleton />
      ) : !journeyData ? (
        <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center text-muted">
          <Trophy className="w-12 h-12 text-muted mx-auto mb-3" />
          <h3 className="text-base font-bold text-text">No Active Journey Found</h3>
          <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
            Select or create a project on the Dashboard to start your innovation journey.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Stat 1: Total XP (Reward) */}
            <motion.div
              whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05, duration: 0.3, ease: [0.16,1,0.3,1] }}
              className="bg-surface border border-border rounded-2xl p-4 text-center card-hover-effect"
            >
              <span className="text-[10px] font-extrabold uppercase text-reward-deep tracking-wider">Total XP</span>
              <div className="text-2xl font-black text-text mt-1 flex items-center justify-center space-x-1">
                <Zap className="w-5 h-5 text-reward fill-reward animate-flame-pulse" />
                <AnimatedNumber value={totalXp} />
              </div>
            </motion.div>

            {/* Stat 2: Current Level (Reward) */}
            <motion.div
              whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.10, duration: 0.3, ease: [0.16,1,0.3,1] }}
              className="bg-surface border border-border rounded-2xl p-4 text-center card-hover-effect"
            >
              <span className="text-[10px] font-extrabold uppercase text-reward-deep tracking-wider">Current Level</span>
              <div className="text-2xl font-black text-text mt-1 flex items-center justify-center space-x-1">
                <Award className="w-5 h-5 text-reward animate-flame-pulse" />
                <span>Lvl {level}</span>
              </div>
            </motion.div>

            {/* Stat 3: Current Stage */}
            <motion.div
              whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.3, ease: [0.16,1,0.3,1] }}
              className="bg-surface border border-border rounded-2xl p-4 text-center card-hover-effect"
            >
              <span className="text-[10px] font-extrabold uppercase text-muted tracking-wider">Current Stage</span>
              <div className="text-base font-extrabold text-text mt-1 truncate">
                {journeyData.current_stage}
              </div>
            </motion.div>

            {/* Stat 4: Completion % */}
            <motion.div
              whileHover={{ y: -3 }} whileTap={{ scale: 0.97 }}
              initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.20, duration: 0.3, ease: [0.16,1,0.3,1] }}
              className="bg-surface border border-border rounded-2xl p-4 text-center card-hover-effect"
            >
              <span className="text-[10px] font-extrabold uppercase text-primary-deep tracking-wider">Completion</span>
              <div className="text-2xl font-black text-primary-deep mt-1">
                <AnimatedNumber value={journeyData.completion_percentage} suffix="%" />
              </div>
            </motion.div>

          </div>

          {/* XP Progress Bar to Next Level (Reward color for XP) */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-text flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-reward" />
                <span>Level {level} Innovator</span>
              </span>
              <span className="text-muted font-semibold">
                {totalXp} / {xpForNextLevel} XP ({Math.round(levelProgressPercentage)}%)
              </span>
            </div>
            <ProgressBar label="Progress to Next Level" value={levelProgressPercentage} color="reward" showPercentage={false} />
          </div>

          {/* Badges Showcase Grid */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-reward-deep uppercase tracking-wider flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4" />
              <span>Innovation Badges Catalog ({journeyData.badges?.length || 0} Unlocked)</span>
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
              {ALL_BADGES_DEFINITIONS.map((def) => {
                const unlockedObj = journeyData.badges?.find(b => b.badge_name === def.name);
                return (
                  <BadgeCard
                    key={def.name}
                    name={def.name}
                    icon={def.icon}
                    unlocked={!!unlockedObj}
                    unlockedAt={unlockedObj?.unlocked_at}
                  />
                );
              })}
            </div>
          </div>

          {/* 7-Stage Interactive Roadmap */}
          <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-text uppercase tracking-wider">
              7 Incubation Stage Roadmap
            </h3>

            <JourneyTimeline
              stages={journeyData.stages || []}
              onCompleteStage={handleCompleteStage}
              completingStage={completingStage}
            />
          </div>

        </div>
      )}

    </div>
  );
};

export default InnovationJourney;
