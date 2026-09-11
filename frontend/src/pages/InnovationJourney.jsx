import React, { useState, useEffect } from 'react';
import { Trophy, ShieldCheck, Zap, RefreshCw, Loader2, Award } from 'lucide-react';
import JourneyTimeline from '../components/JourneyTimeline';
import BadgeCard from '../components/BadgeCard';
import ProgressBar from '../components/ProgressBar';
import AnimatedNumber from '../components/AnimatedNumber';
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

  const unlockedNames = new Set(journeyData?.badges?.map(b => b.badge_name) || []);
  const level = journeyData?.current_level || 1;
  const totalXp = journeyData?.total_xp || 0;
  const xpForNextLevel = journeyData?.xp_for_next_level || 200;
  const baseLevelXp = (level - 1) * 200;
  const levelProgressPercentage = Math.min(100, Math.max(0, ((totalXp - baseLevelXp) / 200) * 100));

  return (
    <div className="space-y-8 animate-page-enter">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Module 3 — Gamified Innovation Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">Innovation Journey Roadmap</h1>
            <p className="text-[#6B6B65] text-sm mt-1">
              Advance your project through 7 incubation stages, earn XP rewards, level up, and collect innovation badges.
            </p>
          </div>

          <button
            onClick={() => loadJourney(activeProject?.id)}
            className="flex items-center space-x-2 px-4 py-2 bg-[#F7F6F2] border border-[#E5E3DD] hover:bg-[#E5E3DD] text-[#171717] rounded-xl text-xs font-bold transition-colors shrink-0 self-start md:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[#E58A4E]" />
            <span>Refresh Journey</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="bg-white border border-[#E5E3DD] rounded-3xl p-12 text-center text-[#6B6B65]">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-[#E58A4E] mb-2" />
          <p className="text-xs">Loading Innovation Roadmap...</p>
        </div>
      ) : !journeyData ? (
        <div className="bg-white border border-dashed border-[#E5E3DD] rounded-3xl p-12 text-center text-[#6B6B65]">
          <Trophy className="w-12 h-12 text-[#6B6B65] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#171717]">No Active Journey Found</h3>
          <p className="text-xs text-[#6B6B65] mt-1 max-w-sm mx-auto">
            Select or create a project on the Dashboard to start your innovation journey.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-page-enter">
          
          {/* Key Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            
            {/* Stat 1: Total XP */}
            <div className="bg-white border border-[#E5E3DD] rounded-2xl p-4 text-center card-hover-effect">
              <span className="text-[10px] font-extrabold uppercase text-[#E58A4E] tracking-wider">Total XP</span>
              <div className="text-2xl font-black text-[#171717] mt-1 flex items-center justify-center space-x-1">
                <Zap className="w-5 h-5 text-[#E58A4E] fill-[#E58A4E]" />
                <AnimatedNumber value={totalXp} />
              </div>
            </div>

            {/* Stat 2: Current Level */}
            <div className="bg-white border border-[#E5E3DD] rounded-2xl p-4 text-center card-hover-effect">
              <span className="text-[10px] font-extrabold uppercase text-[#E58A4E] tracking-wider">Current Level</span>
              <div className="text-2xl font-black text-[#171717] mt-1 flex items-center justify-center space-x-1">
                <Award className="w-5 h-5 text-[#E58A4E]" />
                <span>Lvl {level}</span>
              </div>
            </div>

            {/* Stat 3: Current Stage */}
            <div className="bg-white border border-[#E5E3DD] rounded-2xl p-4 text-center card-hover-effect">
              <span className="text-[10px] font-extrabold uppercase text-[#6B6B65] tracking-wider">Current Stage</span>
              <div className="text-base font-extrabold text-[#171717] mt-1 truncate">
                {journeyData.current_stage}
              </div>
            </div>

            {/* Stat 4: Completion % */}
            <div className="bg-white border border-[#E5E3DD] rounded-2xl p-4 text-center card-hover-effect">
              <span className="text-[10px] font-extrabold uppercase text-[#E58A4E] tracking-wider">Completion</span>
              <div className="text-2xl font-black text-[#E58A4E] mt-1">
                <AnimatedNumber value={journeyData.completion_percentage} suffix="%" />
              </div>
            </div>

          </div>

          {/* XP Progress Bar to Next Level */}
          <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-3">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-[#171717] flex items-center space-x-1.5">
                <Award className="w-4 h-4 text-[#E58A4E]" />
                <span>Level {level} Innovator</span>
              </span>
              <span className="text-[#6B6B65] font-semibold">
                {totalXp} / {xpForNextLevel} XP ({Math.round(levelProgressPercentage)}%)
              </span>
            </div>
            <ProgressBar label="Progress to Next Level" value={levelProgressPercentage} color="orange" showPercentage={false} />
          </div>

          {/* Badges Showcase Grid */}
          <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-[#E58A4E] uppercase tracking-wider flex items-center space-x-2">
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
          <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-4">
            <h3 className="text-xs font-extrabold text-[#171717] uppercase tracking-wider">
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
