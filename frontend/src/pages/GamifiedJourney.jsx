import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle, Award, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { getQuests, getProgress, completeQuest } from '../services/api';

const GamifiedJourney = ({ progress, setProgress, setActiveTab }) => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const questData = await getQuests();
      setCatalog(questData.catalog || []);
      const prog = await getProgress();
      if (setProgress) setProgress(prog);
    } catch (err) {
      console.error('Failed to load gamification data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleQuestComplete = async (questId, xpReward) => {
    setCompletingId(questId);
    try {
      const updated = await completeQuest(questId, xpReward);
      if (setProgress) setProgress(updated);
    } catch (err) {
      console.error('Failed to complete quest:', err);
    } finally {
      setCompletingId(null);
    }
  };

  const completedSet = new Set(progress?.completed_quests || []);
  const level = progress?.level || 1;
  const xp = progress?.xp || 0;
  const nextLevelXP = level * 200;
  const currentLevelBaseXP = (level - 1) * 200;
  const xpProgress = Math.min(100, Math.max(0, ((xp - currentLevelBaseXP) / 200) * 100));

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-amber-900/60 via-slate-800 to-slate-900 border border-amber-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold mb-2">
              <Trophy className="w-3.5 h-3.5" />
              <span>Module 3 — Gamified Innovation Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Innovation Quest Roadmap</h1>
            <p className="text-slate-400 text-sm mt-1">
              Complete key incubation milestones, earn XP, level up, and unlock innovation badges!
            </p>
          </div>

          {/* Gamification Stats Box */}
          <div className="bg-slate-900/90 border border-slate-700/80 rounded-2xl p-4 min-w-[280px]">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-amber-400" />
                <span className="text-sm font-extrabold text-white">Level {level} Innovator</span>
              </div>
              <span className="text-xs font-bold text-indigo-400">{xp} total XP</span>
            </div>

            {/* XP Progress Bar */}
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden border border-slate-700">
              <div 
                className="bg-gradient-to-r from-amber-500 via-indigo-500 to-purple-500 h-full rounded-full transition-all duration-500"
                style={{ width: `${xpProgress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-slate-400 mt-1">
              <span>{xp} XP</span>
              <span>Next Level: {nextLevelXP} XP</span>
            </div>
          </div>
        </div>
      </div>

      {/* Badges Bar */}
      <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
        <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Unlocked Innovation Badges ({progress?.unlocked_badges?.length || 0})</span>
        </h3>
        
        <div className="flex flex-wrap gap-3">
          {progress?.unlocked_badges?.map((badge, idx) => (
            <div 
              key={idx}
              className="flex items-center space-x-2 bg-gradient-to-r from-amber-950/80 to-slate-900 border border-amber-500/40 px-3 py-1.5 rounded-xl shadow"
            >
              <span className="text-base">{badge.title?.split(' ')[0] || '🏆'}</span>
              <div>
                <div className="text-xs font-bold text-amber-300">{badge.title || 'Badge'}</div>
                <div className="text-[10px] text-slate-400">{badge.description}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quests Catalog */}
      {loading ? (
        <div className="p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-amber-400 mb-2" />
          <p className="text-sm">Loading Quest Journey...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {catalog.map((stageGroup, stageIdx) => (
            <div key={stageIdx} className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
              <div className="flex items-center justify-between mb-4 border-b border-slate-700/60 pb-3">
                <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 border border-amber-500/50 text-amber-400 text-xs flex items-center justify-center font-bold">
                    {stageIdx + 1}
                  </span>
                  <span>{stageGroup.stage} Stage</span>
                </h2>
                <span className="text-xs font-semibold text-slate-400">
                  {stageGroup.quests.filter(q => completedSet.has(q.id)).length} / {stageGroup.quests.length} Completed
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {stageGroup.quests.map((quest) => {
                  const isDone = completedSet.has(quest.id);
                  const isPendingThis = completingId === quest.id;

                  return (
                    <div 
                      key={quest.id}
                      className={`p-4 rounded-xl border transition-all flex flex-col justify-between ${
                        isDone 
                          ? 'bg-slate-900/90 border-emerald-800/60 shadow-sm' 
                          : 'bg-slate-900/50 border-slate-700 hover:border-amber-500/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className={`font-semibold text-sm ${isDone ? 'text-emerald-300 line-through' : 'text-white'}`}>
                            {quest.title}
                          </h3>
                          {isDone ? (
                            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                          ) : (
                            <Circle className="w-5 h-5 text-slate-600 shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">{quest.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1 text-xs font-bold text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/50">
                          <Zap className="w-3 h-3" />
                          <span>+{quest.xp} XP</span>
                        </span>

                        {!isDone && (
                          <button
                            onClick={() => handleQuestComplete(quest.id, quest.xp)}
                            disabled={isPendingThis}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center space-x-1 shadow transition-all disabled:opacity-50"
                          >
                            {isPendingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <span>Complete</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </button>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

            </div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GamifiedJourney;
