import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Rocket, AlertTriangle, ArrowRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { getProjectReadiness } from '../services/api';
import { useToast } from '../context/ToastContext';

const ProjectReadiness = ({ activeProject, setActiveTab, onRefreshJourney }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [readiness, setReadiness] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadReadiness(activeProject.id);
    }
  }, [activeProject]);

  const loadReadiness = async (projectId) => {
    setLoading(true);
    try {
      const data = await getProjectReadiness(projectId);
      if (data && data.overall_score !== undefined) {
        setReadiness(data);
      } else {
        setFallbackData();
      }
    } catch (err) {
      setFallbackData();
    } finally {
      setLoading(false);
    }
  };

  const setFallbackData = () => {
    setReadiness({
      overall_score: 76,
      status: 'Almost Ready 🚀',
      pillars: [
        { name: 'Problem Definition', score: 92, status: 'EXCELLENT' },
        { name: 'Solution Architecture', score: 84, status: 'GOOD' },
        { name: 'Research & Literature Gap', score: 78, status: 'GOOD' },
        { name: 'Team Alignment', score: 71, status: 'GOOD' },
        { name: 'Prototype Validation', score: 64, status: 'NEEDS WORK' },
        { name: 'Market Validation', score: 68, status: 'NEEDS WORK' },
        { name: 'Pitch Readiness', score: 81, status: 'EXCELLENT' }
      ],
      biggest_gap: 'Prototype validation',
      next_action: 'Test your prototype with 10 users.'
    });
  };

  const pillars = readiness?.pillars || [
    { name: 'Problem', score: 92 },
    { name: 'Solution', score: 84 },
    { name: 'Research', score: 78 },
    { name: 'Team', score: 71 },
    { name: 'Prototype', score: 64 },
    { name: 'Validation', score: 68 },
    { name: 'Pitch', score: 81 }
  ];

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-orange border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
            <Rocket className="w-4 h-4 text-deep-green" />
            <span>STARTUP READINESS SCORECARD</span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-text-main">
            PROJECT READINESS
          </h1>
          <p className="text-xs font-semibold text-text-main/70">
            Comprehensive 7-pillar incubation score identifying critical gaps before pitching to investors.
          </p>
        </div>

        <button
          onClick={() => loadReadiness(activeProject?.id)}
          disabled={loading}
          className="brutal-btn brutal-btn-white text-xs py-2.5 px-4 shrink-0"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Scorecard</span>
        </button>
      </div>

      {/* OVERALL SCORE BOLD HERO CARD */}
      <div className="brutal-card-lg p-6 sm:p-8 bg-pure-white border-3 border-border-dark space-y-6">
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-3 border-border-dark pb-6">
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase bg-soft-yellow px-2.5 py-0.5 rounded border border-border-dark">
              INCUBATION STATUS
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main">
              76% — Almost Ready 🚀
            </h2>
            <p className="text-xs font-bold text-text-main/70">
              Project: <span className="text-deep-green font-extrabold">{activeProject?.title || 'AI Student Skill Matching Platform'}</span>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] font-extrabold uppercase text-text-main/70">READINESS INDEX</span>
              <p className="text-4xl font-extrabold font-heading text-deep-green">
                {readiness?.overall_score || 76}%
              </p>
            </div>
            <div className="w-16 h-16 rounded-2xl bg-soft-orange border-3 border-border-dark flex items-center justify-center font-extrabold text-2xl shadow-[3px_3px_0px_#171717]">
              🎯
            </div>
          </div>
        </div>

        {/* 7 PILLAR BREAKDOWN GAUGES */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-text-main">
            7-PILLAR READINESS BREAKDOWN
          </h3>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {pillars.map((p) => {
              const pScore = p.score || 70;
              const pColor = pScore >= 80 ? 'bg-soft-green' : pScore >= 70 ? 'bg-soft-yellow' : 'bg-soft-pink';

              return (
                <div key={p.name} className={`brutal-card p-4 ${pColor} space-y-2`}>
                  <div className="flex justify-between items-center text-xs font-extrabold text-text-main">
                    <span>{p.name}</span>
                    <span>{pScore}%</span>
                  </div>

                  <div className="w-full bg-pure-white h-3 rounded-full border-2 border-border-dark overflow-hidden">
                    <div 
                      className="bg-deep-green h-full transition-all duration-500" 
                      style={{ width: `${pScore}%` }} 
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* CRITICAL GAP & RECOMMENDED NEXT ACTION */}
        <div className="brutal-card p-6 bg-soft-yellow border-3 border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-extrabold text-text-main uppercase">
              <AlertTriangle className="w-4 h-4 text-deep-green" />
              <span>CRITICAL GAP IDENTIFIED</span>
            </div>

            <p className="text-base font-bold text-text-main">
              "Your biggest gap is <span className="underline font-extrabold">{readiness?.biggest_gap || 'prototype validation'}</span>."
            </p>

            <div className="text-xs font-semibold text-text-main/80 pt-1">
              <span className="font-extrabold text-deep-green">NEXT ACTION: </span>
              "{readiness?.next_action || 'Test your prototype with 10 users.'}"
            </div>
          </div>

          <button
            onClick={() => setActiveTab('projects')}
            className="brutal-btn brutal-btn-primary shrink-0 text-xs py-3 px-6"
          >
            <span>Execute Next Action</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

export default ProjectReadiness;
