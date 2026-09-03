import React, { useState } from 'react';
import { LayoutDashboard, FolderPlus, Lightbulb, Search, Trophy, Rocket, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';

const Dashboard = ({ projects = [], activeProject, onSelectProject, onCreateProject, setActiveTab }) => {
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newTitle) return;
    setLoading(true);
    try {
      await onCreateProject({ title: newTitle, description: newDesc, domain: newDomain });
      setNewTitle('');
      setNewDesc('');
      setNewDomain('');
      setShowCreateModal(false);
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Hero Welcome Banner */}
      <div className="bg-gradient-to-r from-indigo-900/80 via-purple-900/50 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
              {activeProject ? activeProject.title : 'Welcome to InnoQuest'}
            </h1>
            <p className="text-slate-300 text-sm mt-2 max-w-2xl leading-relaxed">
              {activeProject?.description || 'Transform your student project idea into a pitch-ready venture using AI analysis, literature gap research, and gamified incubation milestones.'}
            </p>
            {activeProject?.domain && (
              <div className="mt-3 inline-block text-xs bg-slate-900/80 border border-slate-700 text-indigo-400 font-semibold px-3 py-1 rounded-lg">
                Domain: {activeProject.domain}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 transition-all shrink-0 self-start md:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Module Navigation Quick Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: AI Advisor */}
        <div 
          onClick={() => setActiveTab('advisor')}
          className="bg-slate-800/80 border border-slate-700 hover:border-indigo-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-indigo-950 border border-indigo-800 text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-indigo-300 transition-colors">1. AI Advisor</h3>
          <p className="text-xs text-slate-400 mt-1">Submit your concept for 7-metric score evaluation & risk analysis.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-indigo-400">
            <span>Launch Advisor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Research Gap */}
        <div 
          onClick={() => setActiveTab('research')}
          className="bg-slate-800/80 border border-slate-700 hover:border-teal-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-teal-950 border border-teal-800 text-teal-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-teal-300 transition-colors">2. Research Gap</h3>
          <p className="text-xs text-slate-400 mt-1">Discover unexplored literature gaps & innovation opportunities.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-teal-400">
            <span>Find Gaps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Innovation Journey */}
        <div 
          onClick={() => setActiveTab('journey')}
          className="bg-slate-800/80 border border-slate-700 hover:border-amber-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-950 border border-amber-800 text-amber-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-amber-300 transition-colors">3. Innovation Journey</h3>
          <p className="text-xs text-slate-400 mt-1">Earn XP, level up, and unlock 7 innovation badges across milestones.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-amber-400">
            <span>View Timeline</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Project Readiness */}
        <div 
          onClick={() => setActiveTab('readiness')}
          className="bg-slate-800/80 border border-slate-700 hover:border-purple-500/60 rounded-2xl p-5 shadow-lg cursor-pointer transition-all hover:-translate-y-1 group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 text-purple-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-white group-hover:text-purple-300 transition-colors">4. Readiness & Pitch</h3>
          <p className="text-xs text-slate-400 mt-1">Calculate 6-pillar readiness score & generate 2-minute pitch deck.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-semibold text-purple-400">
            <span>Generate Pitch</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Projects List Section */}
      <div className="bg-slate-800/60 border border-slate-700 rounded-3xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-bold text-white">Your Active Student Projects ({projects.length})</h2>
        </div>

        <div className="grid md:grid-cols-3 gap-4">
          {projects.map((proj) => {
            const isSelected = activeProject?.id === proj.id;
            return (
              <div
                key={proj.id}
                onClick={() => onSelectProject(proj)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-slate-900 border-indigo-500 ring-1 ring-indigo-500/50 shadow-xl' 
                    : 'bg-slate-900/60 border-slate-700/80 hover:border-slate-600'
                }`}
              >
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-sm text-indigo-300">{proj.title}</h3>
                  {isSelected && (
                    <span className="text-[10px] uppercase tracking-wider font-extrabold bg-indigo-950 text-indigo-400 px-2 py-0.5 rounded border border-indigo-800">
                      Active
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-400 mt-2 line-clamp-2">{proj.description || 'No description provided.'}</p>
                <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-500 font-medium">
                  <span>Domain: {proj.domain || 'General'}</span>
                  <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-700 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-2">Create Student Innovation Project</h2>
            <p className="text-xs text-slate-400 mb-6">Initialize a new project context for your innovation analysis.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Agriculture Soil Sensor"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Technology Domain</label>
                <input
                  type="text"
                  placeholder="e.g. AgriTech / Internet of Things"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Project Overview</label>
                <textarea
                  rows={3}
                  placeholder="Briefly describe what your project aims to accomplish..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex justify-center items-center space-x-2 transition-all disabled:opacity-50"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Project</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
