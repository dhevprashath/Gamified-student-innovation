import React, { useState, useEffect } from 'react';
import { Trophy, CheckCircle, Circle, Award, Zap, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { getQuests, getProgress, completeQuest } from '../services/api';

const GamifiedJourney = ({ progress, setProgress, setActiveTab }) => {
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completingId, setCompletingId] = useState(null);

  useEffect(() => { loadData(); }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const questData = await getQuests();
      setCatalog(questData.catalog || []);
      const prog = await getProgress();
      if (setProgress) setProgress(prog);
    } catch (err) {
      console.error('Failed to load gamification data:', err);
    } finally { setLoading(false); }
  };

  const handleQuestComplete = async (questId, xpReward) => {
    setCompletingId(questId);
    try {
      const updated = await completeQuest(questId, xpReward);
      if (setProgress) setProgress(updated);
    } catch (err) {
      console.error('Failed to complete quest:', err);
    } finally { setCompletingId(null); }
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
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-3xl p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-reward-soft text-reward text-xs font-bold mb-2 border border-reward/20">
              <Trophy className="w-3.5 h-3.5" />
              <span>Module 3 — Gamified Innovation Journey</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text">Innovation Quest Roadmap</h1>
            <p className="text-muted text-sm mt-1">
              Complete key incubation milestones, earn XP, level up, and unlock innovation badges!
            </p>
          </div>

          {/* Gamification Stats Box */}
          <div className="bg-bg border border-border rounded-2xl p-4 min-w-[280px] shadow-warm">
            <div className="flex justify-between items-center mb-2">
              <div className="flex items-center space-x-2">
                <Award className="w-5 h-5 text-reward" />
                <span className="text-sm font-black text-text">Level {level} Innovator</span>
              </div>
              <span className="text-xs font-bold text-primary">{xp} total XP</span>
            </div>
            <div className="w-full bg-border rounded-full h-3 overflow-hidden">
              <motion.div
                className="bg-reward h-full rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${xpProgress}%` }}
                transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted mt-1">
              <span>{xp} XP</span>
              <span>Next Level: {nextLevelXP} XP</span>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Badges Bar */}
      <div className="bg-surface border border-border rounded-3xl p-5 shadow-xs">
        <h3 className="text-xs font-bold text-text uppercase tracking-wider mb-3 flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-reward" />
          <span>Unlocked Innovation Badges ({progress?.unlocked_badges?.length || 0})</span>
        </h3>
        <div className="flex flex-wrap gap-3">
          {progress?.unlocked_badges?.map((badge, idx) => (
            <motion.div
              key={idx}
              whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center space-x-2 bg-reward-soft border border-reward/30 px-3 py-1.5 rounded-xl shadow-warm"
            >
              <span className="text-base">{badge.title?.split(' ')[0] || '🏆'}</span>
              <div>
                <div className="text-xs font-bold text-reward">{badge.title || 'Badge'}</div>
                <div className="text-[10px] text-muted">{badge.description}</div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quests Catalog */}
      {loading ? (
        <div className="p-12 text-center text-muted">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary mb-2" />
          <p className="text-sm">Loading Quest Journey...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {catalog.map((stageGroup, stageIdx) => (
            <motion.div
              key={stageIdx}
              initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: stageIdx * 0.06, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="bg-surface border border-border rounded-3xl p-6 shadow-xs"
            >
              <div className="flex items-center justify-between mb-4 border-b border-border pb-3">
                <h2 className="text-base font-bold text-text flex items-center space-x-2">
                  <span className="w-6 h-6 rounded-full bg-primary-soft border border-primary/30 text-primary text-xs flex items-center justify-center font-bold">
                    {stageIdx + 1}
                  </span>
                  <span>{stageGroup.stage} Stage</span>
                </h2>
                <span className="text-xs font-semibold text-muted">
                  {stageGroup.quests.filter(q => completedSet.has(q.id)).length} / {stageGroup.quests.length} Completed
                </span>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                {stageGroup.quests.map((quest) => {
                  const isDone = completedSet.has(quest.id);
                  const isPendingThis = completingId === quest.id;
                  return (
                    <motion.div
                      key={quest.id}
                      whileHover={!isDone ? { y: -3 } : {}}
                      className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                        isDone
                          ? 'bg-bg border-success/40 opacity-85'
                          : 'bg-bg border-border hover:border-primary/40'
                      }`}
                    >
                      <div>
                        <div className="flex items-start justify-between">
                          <h3 className={`font-bold text-sm ${isDone ? 'text-success line-through' : 'text-text'}`}>
                            {quest.title}
                          </h3>
                          {isDone ? (
                            <CheckCircle className="w-4 h-4 text-success shrink-0" />
                          ) : (
                            <Circle className="w-4 h-4 text-muted shrink-0" />
                          )}
                        </div>
                        <p className="text-xs text-muted mt-2">{quest.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-border flex items-center justify-between">
                        <span className="inline-flex items-center space-x-1 text-xs font-black text-reward bg-reward-soft px-2 py-0.5 rounded border border-reward/20">
                          <Zap className="w-3 h-3" />
                          <span>+{quest.xp} XP</span>
                        </span>

                        {!isDone && (
                          <motion.button
                            whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                            onClick={() => handleQuestComplete(quest.id, quest.xp)}
                            disabled={isPendingThis}
                            className="px-3 py-1.5 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold flex items-center space-x-1 shadow-warm btn-primary-effect disabled:opacity-50 cursor-pointer"
                          >
                            {isPendingThis ? (
                              <Loader2 className="w-3 h-3 animate-spin" />
                            ) : (
                              <>
                                <span>Complete</span>
                                <ArrowRight className="w-3 h-3" />
                              </>
                            )}
                          </motion.button>
                        )}
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </motion.div>
          ))}
        </div>
      )}

    </div>
  );
};

export default GamifiedJourney;
