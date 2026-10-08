import React from 'react';
import { motion } from 'framer-motion';
import { Trophy, CheckCircle2, Lock, Sparkles, Award, Star } from 'lucide-react';

const Gamification = () => {
  const xpCurrent = 780;
  const xpMax = 1000;
  const xpPct = (xpCurrent / xpMax) * 100;

  const achievements = [
    {
      id: 'idea-starter',
      title: 'Idea Starter',
      desc: 'Formulated project vision & problem statement',
      unlocked: true,
      xp: 150,
      icon: '💡',
      color: 'bg-soft-yellow'
    },
    {
      id: 'researcher',
      title: 'Researcher',
      desc: 'Discovered literature gaps & analyzed 5+ external papers',
      unlocked: true,
      xp: 200,
      icon: '🔬',
      color: 'bg-soft-blue'
    },
    {
      id: 'team-builder',
      title: 'Team Builder',
      desc: 'Matched with student developer & UI designer leads',
      unlocked: true,
      xp: 250,
      icon: '👥',
      color: 'bg-soft-green'
    },
    {
      id: 'prototype-builder',
      title: 'Prototype Builder',
      desc: 'Complete prototype validation with 10 active student users',
      unlocked: false,
      xp: 300,
      icon: '🛠',
      color: 'bg-soft-lavender'
    },
    {
      id: 'pitch-ready',
      title: 'Pitch Ready',
      desc: 'Achieve 80%+ readiness score and export pitch deck PDF',
      unlocked: false,
      xp: 400,
      icon: '🎤',
      color: 'bg-soft-pink'
    }
  ];

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-yellow border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <Trophy className="w-4 h-4 text-deep-green" />
          <span>GAMIFIED INCUBATION MILESTONES</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-text-main">
          ACHIEVEMENTS & LEVEL PROGRESS
        </h1>
        <p className="text-xs font-semibold text-text-main/70">
          Earn XP by completing innovation milestones, validating prototypes, and refining your pitch deck.
        </p>
      </div>

      {/* LEVEL PROGRESS BOLD CARD */}
      <div className="brutal-card-lg p-6 sm:p-8 bg-pure-white border-3 border-border-dark space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-border-dark pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase bg-soft-orange px-2.5 py-0.5 rounded border border-border-dark">
              CURRENT LEVEL
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main mt-1">
              LEVEL 04 — BUILDER 🏆
            </h2>
          </div>

          <div className="text-right">
            <span className="text-xs font-extrabold text-text-main/70 uppercase">XP Score</span>
            <p className="text-2xl font-extrabold font-heading text-deep-green">
              {xpCurrent} / {xpMax} XP
            </p>
          </div>
        </div>

        {/* CHUNKY NEO-BRUTALIST XP BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs font-extrabold text-text-main">
            <span>LEVEL 04 (BUILDER)</span>
            <span>NEXT LEVEL: LEVEL 05 (PITCHER) AT 1,000 XP</span>
          </div>

          <div className="w-full bg-bg-main h-8 rounded-xl border-3 border-border-dark overflow-hidden p-1 shadow-[3px_3px_0px_#171717] flex items-center">
            <div
              className="bg-deep-green h-full rounded-lg font-mono text-xs text-white font-extrabold flex items-center justify-center transition-all duration-700"
              style={{ width: `${xpPct}%` }}
            >
              {xpCurrent} XP ({Math.round(xpPct)}%)
            </div>
          </div>
        </div>
      </div>

      {/* MILESTONE BADGES GRID */}
      <div className="space-y-4">
        <h3 className="text-xl font-extrabold font-heading text-text-main">
          INCUBATION BADGES & MILESTONES
        </h3>

        <div className="grid md:grid-cols-2 gap-4">
          {achievements.map((ach) => (
            <div
              key={ach.id}
              className={`brutal-card p-5 border-3 border-border-dark space-y-3 ${
                ach.unlocked ? ach.color : 'bg-bg-main opacity-70'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-pure-white border-2 border-border-dark flex items-center justify-center text-lg shadow-[2px_2px_0px_#171717]">
                    {ach.icon}
                  </div>
                  <div>
                    <h4 className="text-base font-extrabold font-heading text-text-main">
                      {ach.unlocked ? '✓ ' : '○ '}{ach.title}
                    </h4>
                    <span className="text-[10px] font-extrabold uppercase bg-pure-white border border-border-dark px-2 py-0.5 rounded">
                      +{ach.xp} XP
                    </span>
                  </div>
                </div>

                <span className="text-xs font-extrabold">
                  {ach.unlocked ? (
                    <span className="bg-deep-green text-white px-2 py-1 rounded">UNLOCKED</span>
                  ) : (
                    <span className="bg-bg-main text-text-main/60 px-2 py-1 rounded border border-border-dark">LOCKED</span>
                  )}
                </span>
              </div>

              <p className="text-xs font-semibold text-text-main/80">
                {ach.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default Gamification;
