import React, { useState } from 'react';
import { FolderPlus, Lightbulb, Search, Trophy, Rocket, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useToast } from '../context/ToastContext';

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.07, duration: 0.32, ease: [0.16, 1, 0.3, 1] },
  }),
};

const Dashboard = ({ projects = [], activeProject, onSelectProject, onCreateProject, setActiveTab }) => {
  const { addToast } = useToast();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [isShaking, setIsShaking] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle.trim()) {
      setFormError('Project title is required.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
      return;
    }

    setLoading(true);
    setFormError('');
    try {
      const created = await onCreateProject({
        title: newTitle.trim(),
        description: newDesc.trim(),
        domain: newDomain.trim(),
        problem_statement: newProblem.trim()
      });
      setNewTitle('');
      setNewDesc('');
      setNewDomain('');
      setNewProblem('');
      setShowCreateModal(false);

      addToast({
        title: 'Project Initialized',
        description: `"${created?.title || newTitle}" is now active in your workspace.`,
        type: 'success',
        xpBonus: 50
      });
    } catch (err) {
      console.error('Failed to create project:', err);
      setFormError('Failed to create project. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.25 }}
    >
      {/* Hero Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary-deep text-xs font-bold mb-3 border border-primary/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-text tracking-tight">
              {activeProject ? activeProject.title : 'Welcome to InnoQuest'}
            </h1>
            <p className="text-muted text-sm mt-2 leading-relaxed">
              {activeProject?.description || 'Transform your student project idea into a pitch-ready venture using AI analysis, literature gap research, and gamified incubation milestones.'}
            </p>
            {activeProject?.domain && (
              <div className="mt-3 inline-block text-xs bg-bg border border-border text-primary-deep font-semibold px-3 py-1 rounded-lg">
                Domain: {activeProject.domain}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-primary hover:opacity-90 text-on-primary font-bold rounded-2xl text-xs sm:text-sm btn-primary-effect shadow-xs shrink-0 self-start md:self-auto cursor-pointer"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </motion.div>

      {/* Quick Module Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: AI Advisor */}
        <motion.div
          custom={0} variants={cardVariants} initial="hidden" animate="visible"
          whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('advisor')}
          className="bg-surface border border-border rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-deep flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-text group-hover:text-primary-deep transition-colors">1. AI Advisor</h3>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">Submit your concept for 7-metric score evaluation & risk analysis.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-primary-deep">
            <span>Launch Advisor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 2: Research Gap */}
        <motion.div
          custom={1} variants={cardVariants} initial="hidden" animate="visible"
          whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('research')}
          className="bg-surface border border-border rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-deep flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-text group-hover:text-primary-deep transition-colors">2. Research Gap</h3>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">Discover unexplored literature gaps & innovation opportunities.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-primary-deep">
            <span>Find Gaps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 3: Innovation Journey */}
        <motion.div
          custom={2} variants={cardVariants} initial="hidden" animate="visible"
          whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('journey')}
          className="bg-surface border border-border rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-deep flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-text group-hover:text-primary-deep transition-colors">3. Innovation Journey</h3>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">Earn XP, level up, and unlock 7 innovation badges across milestones.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-primary-deep">
            <span>View Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

        {/* Card 4: Project Readiness */}
        <motion.div
          custom={3} variants={cardVariants} initial="hidden" animate="visible"
          whileHover={{ y: -5 }} whileTap={{ scale: 0.97 }}
          onClick={() => setActiveTab('readiness')}
          className="bg-surface border border-border rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-primary-soft text-primary-deep flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-text group-hover:text-primary-deep transition-colors">4. Readiness & Pitch</h3>
          <p className="text-xs text-muted mt-1.5 leading-relaxed">Calculate 6-pillar readiness score & generate 2-minute pitch deck.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-primary-deep">
            <span>Generate Pitch</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </motion.div>

      </div>

      {/* Projects List Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.28, duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-3xl p-6 shadow-xs"
      >
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-text">Active Student Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-bg rounded-2xl border border-dashed border-border">
            <FolderPlus className="w-10 h-10 text-muted mx-auto mb-2" />
            <h3 className="text-sm font-bold text-text">No projects yet</h3>
            <p className="text-xs text-muted mt-1 max-w-sm mx-auto">Start your first innovation project and begin your journey.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold btn-primary-effect inline-flex items-center space-x-1.5 cursor-pointer"
            >
              <FolderPlus className="w-3.5 h-3.5" />
              <span>Create First Project</span>
            </button>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-4">
            {projects.map((proj) => {
              const isSelected = activeProject?.id === proj.id;
              return (
                <div
                  key={proj.id}
                  onClick={() => onSelectProject(proj)}
                  className={`p-5 rounded-2xl border transition-all cursor-pointer card-hover-effect ${
                    isSelected 
                      ? 'bg-surface border-primary ring-2 ring-primary/20 shadow-sm' 
                      : 'bg-bg border-border'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-text">{proj.title}</h3>
                    {isSelected && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-primary-soft text-primary-deep px-2 py-0.5 rounded border border-primary/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted mt-2 line-clamp-2 leading-relaxed">{proj.description || 'No description provided.'}</p>
                  <div className="mt-4 pt-3 border-t border-border flex justify-between items-center text-[10px] text-muted font-semibold">
                    <span>Domain: {proj.domain || 'General'}</span>
                    <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>

      {/* Create Project Modal */}
      <AnimatePresence>
      {showCreateModal && (
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-[rgba(31,26,22,0.62)] backdrop-blur-xs p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 8 }}
            transition={{ type: 'spring', stiffness: 340, damping: 28 }}
            className={`bg-surface border border-border rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl ${isShaking ? 'animate-shake' : ''}`}
          >
            <h2 className="text-xl font-extrabold text-text mb-1">Create Student Innovation Project</h2>
            <p className="text-xs text-muted mb-5">Initialize a new project context for your innovation analysis.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Agriculture Soil Sensor"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setFormError(''); }}
                  className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Technology Domain</label>
                <input
                  type="text"
                  placeholder="e.g. AgriTech / Internet of Things"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Problem Statement (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Leave blank to auto-generate a title-relevant default problem statement..."
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-text mb-1">Project Overview</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what your project aims to accomplish..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
                />
              </div>

              {formError && (
                <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs font-medium animate-fade-in">
                  {formError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setFormError(''); }}
                  className="flex-1 py-2.5 bg-bg hover:bg-border text-text rounded-xl text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-primary hover:opacity-90 text-on-primary rounded-xl text-xs font-bold btn-primary-effect shadow-xs flex justify-center items-center space-x-2 transition-all disabled:opacity-50 cursor-pointer"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin text-on-primary" /> : <span>Create Project</span>}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>

    </motion.div>
  );
};

export default Dashboard;
