import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, Clock, FolderPlus, Sparkles, Trophy, Rocket, Search, Users } from 'lucide-react';

const Dashboard = ({ 
  projects = [], 
  activeProject, 
  onSelectProject, 
  onCreateProject, 
  setActiveTab,
  onOpenCreateModal 
}) => {
  const lifecycleStages = [
    { name: 'IDEA', status: 'done' },
    { name: 'RESEARCH', status: 'done' },
    { name: 'VALIDATION', status: 'done' },
    { name: 'TEAM', status: 'done' },
    { name: 'PLANNING', status: 'active' },
    { name: 'PROTOTYPE', status: 'pending' },
    { name: 'MENTOR', status: 'pending' },
    { name: 'PITCH', status: 'pending' },
    { name: 'FUNDING', status: 'pending' },
    { name: 'STARTUP', status: 'pending' }
  ];

  return (
    <div className="space-y-8 py-4 pb-20">

      {/* ── TOP GREETING HEADER ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main">
            Good morning, Dhev 👋
          </h1>
          <p className="text-sm font-semibold text-text-main/70 mt-1">
            Let's move your project forward.
          </p>
        </div>

        <button
          onClick={onOpenCreateModal}
          className="brutal-btn brutal-btn-primary py-2.5 px-4 text-xs shrink-0 self-start md:self-auto"
        >
          <FolderPlus className="w-4 h-4" />
          <span>New Project</span>
        </button>
      </div>

      {/* ── DOMINANT MAIN PROJECT WORKSPACE CARD ── */}
      <div className="brutal-card-lg p-6 sm:p-8 bg-pure-white border-3 border-border-dark space-y-6 relative overflow-hidden">
        
        {/* Top bar info */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-b-3 border-border-dark pb-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">⚡</span>
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-widest bg-soft-yellow px-2 py-0.5 rounded border border-border-dark">
                PRIMARY WORKSPACE
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-main mt-0.5">
                {activeProject ? activeProject.title : 'AI Student Skill Matching Platform'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] font-extrabold text-text-main/70 uppercase">Progress</span>
              <p className="text-xl font-extrabold font-heading text-deep-green">64%</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-soft-green border-2 border-border-dark flex items-center justify-center font-extrabold text-sm shadow-[2px_2px_0px_#171717]">
              64%
            </div>
          </div>
        </div>

        {/* LIFECYCLE TRACKER BAR */}
        <div className="space-y-3">
          <div className="flex justify-between items-center text-xs font-extrabold text-text-main uppercase tracking-wider">
            <span>INNOVATION LIFECYCLE</span>
            <span>STAGE 5 OF 10: PLANNING</span>
          </div>

          <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
            {lifecycleStages.map((st, idx) => (
              <div 
                key={st.name}
                className={`p-2 rounded-xl border-2 border-border-dark text-center font-extrabold text-[10px] flex flex-col items-center justify-center gap-1 shadow-[2px_2px_0px_#171717] ${
                  st.status === 'done'
                    ? 'bg-soft-green text-text-main'
                    : st.status === 'active'
                    ? 'bg-soft-yellow text-text-main ring-2 ring-deep-green'
                    : 'bg-bg-main text-text-main/50'
                }`}
              >
                <span>
                  {st.status === 'done' ? '✓' : st.status === 'active' ? '●' : '○'}
                </span>
                <span className="truncate w-full">{st.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* NEXT ACTION CALLOUT CARD */}
        <div className="brutal-card p-5 bg-soft-orange/30 border-2 border-border-dark flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-deep-green">
              <Clock className="w-4 h-4" />
              <span>RECOMMENDED NEXT ACTION</span>
            </div>
            <h3 className="text-lg font-extrabold font-heading text-text-main">
              Complete your prototype validation
            </h3>
            <p className="text-xs font-medium text-text-main/80">
              Gather feedback from at least 10 target campus users to move to Prototype phase.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('readiness')}
            className="brutal-btn brutal-btn-primary shrink-0 text-xs py-3 px-5"
          >
            <span>Continue Project</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>

      {/* ── QUICK LIFECYCLE ACTIONS GRID ── */}
      <div className="grid md:grid-cols-3 gap-6">
        
        <div 
          onClick={() => setActiveTab('advisor')}
          className="brutal-card p-6 bg-soft-yellow brutal-card-hover cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-pure-white border-2 border-border-dark flex items-center justify-center font-bold shadow-[2px_2px_0px_#171717]">
            💡
          </div>
          <h3 className="text-lg font-extrabold font-heading text-text-main">1. AI Advisor</h3>
          <p className="text-xs font-semibold text-text-main/80">
            Analyze problem clarity, feasibility, & innovation potential.
          </p>
          <div className="text-xs font-extrabold text-deep-green flex items-center gap-1 pt-1">
            <span>Analyze Idea</span> ➔
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('research')}
          className="brutal-card p-6 bg-soft-blue brutal-card-hover cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-pure-white border-2 border-border-dark flex items-center justify-center font-bold shadow-[2px_2px_0px_#171717]">
            🔬
          </div>
          <h3 className="text-lg font-extrabold font-heading text-text-main">2. Research Gap</h3>
          <p className="text-xs font-semibold text-text-main/80">
            Search top semantically similar GitHub projects & papers.
          </p>
          <div className="text-xs font-extrabold text-deep-green flex items-center gap-1 pt-1">
            <span>Explore Research</span> ➔
          </div>
        </div>

        <div 
          onClick={() => setActiveTab('teams')}
          className="brutal-card p-6 bg-soft-pink brutal-card-hover cursor-pointer space-y-3"
        >
          <div className="w-10 h-10 rounded-xl bg-pure-white border-2 border-border-dark flex items-center justify-center font-bold shadow-[2px_2px_0px_#171717]">
            👥
          </div>
          <h3 className="text-lg font-extrabold font-heading text-text-main">3. Team Formation</h3>
          <p className="text-xs font-semibold text-text-main/80">
            Match with recommended developers, UI designers, & marketers.
          </p>
          <div className="text-xs font-extrabold text-deep-green flex items-center gap-1 pt-1">
            <span>Build Team</span> ➔
          </div>
        </div>

      </div>

      {/* ── ALL PROJECTS LIST ── */}
      <div className="brutal-card p-6 bg-pure-white space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-extrabold font-heading text-text-main">
            Your Innovation Projects ({projects.length})
          </h3>
          <button
            onClick={onOpenCreateModal}
            className="text-xs font-extrabold text-deep-green hover:underline flex items-center gap-1"
          >
            + Create New
          </button>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-bg-main rounded-xl border-2 border-dashed border-border-dark space-y-2">
            <p className="text-xs font-bold text-text-main">No projects initialized yet.</p>
            <button
              onClick={onOpenCreateModal}
              className="brutal-btn brutal-btn-primary text-xs py-2 px-4"
            >
              Start First Project
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {projects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className={`p-4 rounded-xl border-2 border-border-dark cursor-pointer transition-all ${
                    isSelected ? 'bg-soft-green shadow-[4px_4px_0px_#171717]' : 'bg-pure-white hover:bg-soft-yellow/40'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <h4 className="font-extrabold text-sm text-text-main">{proj.title}</h4>
                    {isSelected && (
                      <span className="text-[10px] font-extrabold bg-deep-green text-white px-2 py-0.5 rounded">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-text-main/70 mt-1 line-clamp-2">
                    {proj.description || 'No description added yet.'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
};

export default Dashboard;
