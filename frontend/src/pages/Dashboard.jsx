import React, { useState } from 'react';
import { LayoutDashboard, FolderPlus, Lightbulb, Search, Trophy, Rocket, Sparkles, ArrowRight, Loader2 } from 'lucide-react';
import { useToast } from '../context/ToastContext';

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
    <div className="space-y-8 animate-page-enter">
      
      {/* Hero Welcome Banner - Stagger 1 */}
      <div className="stagger-1 animate-page-enter bg-white border border-[#E5E3DD] rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold mb-3 border border-[#E58A4E]/20">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Student Innovation Workspace</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-black text-[#171717] tracking-tight">
              {activeProject ? activeProject.title : 'Welcome to InnoQuest'}
            </h1>
            <p className="text-[#6B6B65] text-sm mt-2 leading-relaxed">
              {activeProject?.description || 'Transform your student project idea into a pitch-ready venture using AI analysis, literature gap research, and gamified incubation milestones.'}
            </p>
            {activeProject?.domain && (
              <div className="mt-3 inline-block text-xs bg-[#F7F6F2] border border-[#E5E3DD] text-[#E58A4E] font-semibold px-3 py-1 rounded-lg">
                Domain: {activeProject.domain}
              </div>
            )}
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-5 py-3 bg-[#E58A4E] hover:bg-[#D4793D] text-white font-bold rounded-2xl text-xs sm:text-sm btn-primary-effect shadow-xs shrink-0 self-start md:self-auto"
          >
            <FolderPlus className="w-4 h-4" />
            <span>Create New Project</span>
          </button>
        </div>
      </div>

      {/* Quick Module Cards - Stagger 2 */}
      <div className="stagger-2 animate-page-enter grid md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Card 1: AI Advisor */}
        <div 
          onClick={() => setActiveTab('advisor')}
          className="bg-white border border-[#E5E3DD] rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F8E8DB] text-[#E58A4E] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Lightbulb className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717] group-hover:text-[#E58A4E] transition-colors">1. AI Advisor</h3>
          <p className="text-xs text-[#6B6B65] mt-1.5 leading-relaxed">Submit your concept for 7-metric score evaluation & risk analysis.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-[#E58A4E]">
            <span>Launch Advisor</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 2: Research Gap */}
        <div 
          onClick={() => setActiveTab('research')}
          className="bg-white border border-[#E5E3DD] rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F8E8DB] text-[#E58A4E] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Search className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717] group-hover:text-[#E58A4E] transition-colors">2. Research Gap</h3>
          <p className="text-xs text-[#6B6B65] mt-1.5 leading-relaxed">Discover unexplored literature gaps & innovation opportunities.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-[#E58A4E]">
            <span>Find Gaps</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 3: Innovation Journey */}
        <div 
          onClick={() => setActiveTab('journey')}
          className="bg-white border border-[#E5E3DD] rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F8E8DB] text-[#E58A4E] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Trophy className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717] group-hover:text-[#E58A4E] transition-colors">3. Innovation Journey</h3>
          <p className="text-xs text-[#6B6B65] mt-1.5 leading-relaxed">Earn XP, level up, and unlock 7 innovation badges across milestones.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-[#E58A4E]">
            <span>View Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        {/* Card 4: Project Readiness */}
        <div 
          onClick={() => setActiveTab('readiness')}
          className="bg-white border border-[#E5E3DD] rounded-2xl p-5 shadow-xs cursor-pointer card-hover-effect group"
        >
          <div className="w-10 h-10 rounded-xl bg-[#F8E8DB] text-[#E58A4E] flex items-center justify-center mb-4 transition-transform group-hover:scale-105">
            <Rocket className="w-5 h-5" />
          </div>
          <h3 className="font-bold text-base text-[#171717] group-hover:text-[#E58A4E] transition-colors">4. Readiness & Pitch</h3>
          <p className="text-xs text-[#6B6B65] mt-1.5 leading-relaxed">Calculate 6-pillar readiness score & generate 2-minute pitch deck.</p>
          <div className="mt-4 flex items-center space-x-1 text-xs font-bold text-[#E58A4E]">
            <span>Generate Pitch</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

      </div>

      {/* Projects List Section - Stagger 3 */}
      <div className="stagger-3 animate-page-enter bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-bold text-[#171717]">Active Student Projects ({projects.length})</h2>
        </div>

        {projects.length === 0 ? (
          <div className="p-8 text-center bg-[#F7F6F2] rounded-2xl border border-dashed border-[#E5E3DD]">
            <FolderPlus className="w-10 h-10 text-[#6B6B65] mx-auto mb-2" />
            <h3 className="text-sm font-bold text-[#171717]">No projects yet</h3>
            <p className="text-xs text-[#6B6B65] mt-1 max-w-sm mx-auto">Start your first innovation project and begin your journey.</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="mt-4 px-4 py-2 bg-[#E58A4E] hover:bg-[#D4793D] text-white rounded-xl text-xs font-bold btn-primary-effect inline-flex items-center space-x-1.5"
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
                      ? 'bg-white border-[#E58A4E] ring-2 ring-[#E58A4E]/10 shadow-sm' 
                      : 'bg-[#F7F6F2] border-[#E5E3DD]'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-bold text-sm text-[#171717]">{proj.title}</h3>
                    {isSelected && (
                      <span className="text-[10px] uppercase tracking-wider font-extrabold bg-[#F8E8DB] text-[#E58A4E] px-2 py-0.5 rounded border border-[#E58A4E]/30">
                        Active
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#6B6B65] mt-2 line-clamp-2 leading-relaxed">{proj.description || 'No description provided.'}</p>
                  <div className="mt-4 pt-3 border-t border-[#E5E3DD] flex justify-between items-center text-[10px] text-[#6B6B65] font-semibold">
                    <span>Domain: {proj.domain || 'General'}</span>
                    <span>{new Date(proj.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#171717]/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className={`bg-white border border-[#E5E3DD] rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-xl animate-modal-enter ${isShaking ? 'animate-shake' : ''}`}>
            <h2 className="text-xl font-extrabold text-[#171717] mb-1">Create Student Innovation Project</h2>
            <p className="text-xs text-[#6B6B65] mb-5">Initialize a new project context for your innovation analysis.</p>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Project Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Smart Agriculture Soil Sensor"
                  value={newTitle}
                  onChange={(e) => { setNewTitle(e.target.value); setFormError(''); }}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Technology Domain</label>
                <input
                  type="text"
                  placeholder="e.g. AgriTech / Internet of Things"
                  value={newDomain}
                  onChange={(e) => setNewDomain(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Problem Statement (Optional)</label>
                <textarea
                  rows={2}
                  placeholder="Leave blank to auto-generate a title-relevant default problem statement..."
                  value={newProblem}
                  onChange={(e) => setNewProblem(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Project Overview</label>
                <textarea
                  rows={2}
                  placeholder="Briefly describe what your project aims to accomplish..."
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>

              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-fade-in">
                  {formError}
                </div>
              )}

              <div className="flex space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateModal(false); setFormError(''); }}
                  className="flex-1 py-2.5 bg-[#F7F6F2] hover:bg-[#E5E3DD] text-[#171717] rounded-xl text-xs font-bold transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 py-2.5 bg-[#E58A4E] hover:bg-[#D4793D] text-white rounded-xl text-xs font-bold btn-primary-effect shadow-xs flex justify-center items-center space-x-2 transition-all disabled:opacity-50"
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
