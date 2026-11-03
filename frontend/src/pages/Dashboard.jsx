import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2, Circle, Clock, FolderPlus, Layers, Loader2, RefreshCw, Sparkles, Trophy, Rocket, Search, Users } from 'lucide-react';
import { generateModuleSuggestions, getModuleSuggestions } from '../services/api';

// ── PRIORITY → COLOR MAP for suggested module badges ──
const MODULE_PRIORITY_STYLES = {
  Critical:   'bg-soft-pink',
  High:       'bg-soft-orange',
  Recommended:'bg-soft-blue',
  Optional:   'bg-bg-main text-text-main/60',
};

const Dashboard = ({
  projects = [], 
  activeProject, 
  onSelectProject, 
  onCreateProject, 
  setActiveTab,
  onOpenCreateModal 
}) => {
  // ── SUGGESTED MODULES (AI-generated module ideas for the active project) ──
  const [suggestedModules, setSuggestedModules] = useState([]);
  const [modulesLoading, setModulesLoading] = useState(false);
  const [modulesGenerating, setModulesGenerating] = useState(false);
  const [modulesFallback, setModulesFallback] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!activeProject?.id || typeof activeProject.id !== 'number') return;
    setModulesLoading(true);
    setSuggestedModules([]);
    (async () => {
      try {
        // Samples are pre-seeded per project, so this usually returns instantly.
        // Auto AI-generation only happens as a last resort if the project has
        // never been seeded (no samples, no AI set).
        const stored = await getModuleSuggestions(activeProject.id);
        if (cancelled) return;
        if (stored?.modules?.length) {
          setSuggestedModules(stored.modules);
          setModulesFallback(stored.source === 'Sample');
          setModulesLoading(false);
        } else {
          const generated = await generateModuleSuggestions(activeProject.id);
          if (cancelled) return;
          setSuggestedModules(generated?.modules || []);
          setModulesFallback(false);
        }
      } catch (err) {
        console.error('Module suggestion fetch failed:', err);
        if (!cancelled) setSuggestedModules([]);
      } finally {
        if (!cancelled) setModulesLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [activeProject?.id]);

  const handleGenerateModules = async () => {
    if (!activeProject?.id || typeof activeProject.id !== 'number') return;
    setModulesGenerating(true);
    try {
      const generated = await generateModuleSuggestions(activeProject.id);
      setSuggestedModules(generated?.modules || []);
      setModulesFallback(generated?.source === 'Sample');
    } catch (err) {
      console.error('Module suggestion generation failed:', err);
    } finally {
      setModulesGenerating(false);
    }
  };

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

      {/* ── AI-SUGGESTED MODULE IDEAS (shown after the AI Advisor module section) ── */}
      <div className="brutal-card-lg p-6 sm:p-8 bg-pure-white border-3 border-border-dark space-y-5">
        <div className="flex flex-wrap justify-between items-center gap-3 border-b-3 border-border-dark pb-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-soft-yellow px-2 py-0.5 rounded border border-border-dark">
              MODULE IDEAS
            </span>
            <h3 className="text-xl font-extrabold font-heading text-text-main mt-1 flex items-center gap-2">
              <Layers className="w-5 h-5 text-deep-green" />
              Suggested Modules for "{activeProject?.title || 'Your Project'}"
            </h3>
            <p className="text-xs font-semibold text-text-main/70 mt-1">
              AI-architected building blocks for this project — generate fresh ideas anytime.
            </p>
          </div>
          <button
            onClick={handleGenerateModules}
            disabled={modulesGenerating || modulesLoading}
            className="brutal-btn brutal-btn-primary py-2.5 px-4 text-xs shrink-0 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {modulesGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            <span>{modulesGenerating ? 'Generating...' : 'Regenerate Ideas'}</span>
          </button>
        </div>

        {modulesFallback && suggestedModules.length > 0 && (
          <p className="text-[11px] font-bold text-deep-green border border-border-dark bg-bg-main rounded-lg px-3 py-2">
            🧩 Starter sample modules (related to this project) — instant & free. Tap <span className="font-extrabold">Regenerate Ideas</span> anytime for AI-personalized suggestions.
          </p>
        )}

        {modulesLoading || modulesGenerating ? (
          <div className="grid md:grid-cols-2 gap-4">
            {[0, 1].map((i) => (
              <div key={i} className="p-5 rounded-xl border-2 border-border-dark bg-bg-main animate-pulse space-y-3">
                <div className="flex gap-2 items-start justify-between">
                  <div className="h-4 w-2/3 bg-border-dark/20 rounded" />
                  <div className="h-4 w-12 bg-border-dark/20 rounded" />
                </div>
                <div className="h-3 w-full bg-border-dark/20 rounded" />
                <div className="h-3 w-4/5 bg-border-dark/20 rounded" />
                <div className="flex gap-2">
                  <div className="h-5 w-16 bg-border-dark/20 rounded-full" />
                  <div className="h-5 w-20 bg-border-dark/20 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        ) : suggestedModules.length === 0 ? (
          <div className="p-8 text-center bg-bg-main rounded-xl border-2 border-dashed border-border-dark space-y-2">
            <p className="text-xs font-bold text-text-main">
              No module ideas yet for this project.
            </p>
            <button
              onClick={handleGenerateModules}
              className="brutal-btn brutal-btn-primary text-xs py-2 px-4"
            >
              Generate with AI
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {suggestedModules.map((mod, idx) => (
              <motion.div
                key={mod.id || `${mod.name}-${idx}`}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05, duration: 0.25 }}
                className="p-5 rounded-xl border-2 border-border-dark bg-pure-white hover:shadow-[4px_4px_0px_#171717] transition-shadow space-y-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <h4 className="font-extrabold text-sm text-text-main leading-snug">
                    {mod.name}
                  </h4>
                  <span
                    className={`text-[10px] font-extrabold px-2 py-0.5 rounded border border-border-dark shrink-0 ${
                      MODULE_PRIORITY_STYLES[mod.priority] || 'bg-bg-main'
                    }`}
                  >
                    {mod.priority || 'High'}
                  </span>
                </div>

                <p className="text-xs text-text-main/70 line-clamp-3">
                  {mod.description || 'No description provided.'}
                </p>

                <div className="flex flex-wrap gap-1.5">
                  <span className="text-[10px] font-extrabold bg-soft-green px-2 py-0.5 rounded border border-border-dark">
                    {mod.category || 'Core Architecture'}
                  </span>
                  <span className="text-[10px] font-extrabold bg-soft-yellow px-2 py-0.5 rounded border border-border-dark">
                    ⏱ {mod.estimated_duration || '1-2 Weeks'}
                  </span>
                  <span className="text-[10px] font-extrabold bg-bg-main px-2 py-0.5 rounded border border-border-dark">
                    {mod.complexity || 'Medium'}
                  </span>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold text-text-main/60 uppercase tracking-wider mb-1">Key Features</p>
                  <ul className="text-xs text-text-main/80 font-semibold space-y-0.5">
                    {(mod.key_features || []).slice(0, 3).map((f, fi) => (
                      <li key={fi} className="flex items-start gap-1.5">
                        <Sparkles className="w-3 h-3 mt-0.5 text-deep-green shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                </div>

                {(mod.tech_stack || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1 border-t border-border-dark">
                    {mod.tech_stack.slice(0, 5).map((t, ti) => (
                      <span key={ti} className="text-[10px] font-bold text-text-main/60 bg-bg-main px-1.5 py-0.5 rounded">
                        {t}
                      </span>
                    ))}
                  </div>
                )}

                {mod.deliverable && (
                  <p className="text-[11px] font-extrabold text-deep-green flex items-start gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                    {mod.deliverable}
                  </p>
                )}
              </motion.div>
            ))}
          </div>
        )}
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
