import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'framer-motion';
import SidebarNav from './components/SidebarNav';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';
import IdeaCreation from './pages/IdeaCreation';
import InnovationAdvisor from './pages/InnovationAdvisor';
import ResearchGap from './pages/ResearchGap';
import TeamFormation from './pages/TeamFormation';
import ProjectWorkspace from './pages/ProjectWorkspace';
import MentorMarketplace from './pages/MentorMarketplace';
import FundingIncubation from './pages/FundingIncubation';
import PitchStudio from './pages/PitchStudio';
import Gamification from './pages/Gamification';
import ProjectReadiness from './pages/ProjectReadiness';
import SettingsPage from './pages/SettingsPage';

import { getProjects, createProject } from './services/api';
import { ToastProvider, useToast } from './context/ToastContext';
import { FolderPlus, Loader2, X } from 'lucide-react';

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
  transition: { duration: 0.2, ease: [0.16, 1, 0.3, 1] },
};

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('landing');
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newDomain, setNewDomain] = useState('');
  const [newProblem, setNewProblem] = useState('');
  const [createLoading, setCreateLoading] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      const loaded = data || [];
      setProjects(loaded);
      if (loaded.length > 0) {
        if (!activeProject || !loaded.some(p => p.id === activeProject.id)) {
          setActiveProject(loaded[0]);
        }
      } else {
        // Mock default student project if backend returns empty
        const defaultProj = {
          id: 1,
          title: 'AI Student Skill Matching Platform',
          description: 'Semantic developer & co-founder matching platform using sentence-transformers all-MiniLM-L6-v2.',
          domain: 'EdTech & AI',
          problem_statement: 'College students struggle to find skilled project partners and validate early capstone ideas.'
        };
        setProjects([defaultProj]);
        setActiveProject(defaultProj);
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
      const defaultProj = {
        id: 1,
        title: 'AI Student Skill Matching Platform',
        description: 'Semantic developer & co-founder matching platform using sentence-transformers all-MiniLM-L6-v2.',
        domain: 'EdTech & AI',
        problem_statement: 'College students struggle to find skilled project partners and validate early capstone ideas.'
      };
      setProjects([defaultProj]);
      setActiveProject(defaultProj);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e) => {
    if (e) e.preventDefault();
    if (!newTitle.trim()) return;

    setCreateLoading(true);
    try {
      const created = await createProject({
        title: newTitle.trim(),
        description: newDesc.trim(),
        domain: newDomain.trim() || 'Software',
        problem_statement: newProblem.trim()
      });
      setProjects(prev => [created, ...prev]);
      setActiveProject(created);
      setNewTitle('');
      setNewDesc('');
      setNewDomain('');
      setNewProblem('');
      setShowCreateModal(false);
      setActiveTab('dashboard');
    } catch (err) {
      console.error('Failed to create project:', err);
      // Fallback local creation
      const localProj = {
        id: Date.now(),
        title: newTitle.trim(),
        description: newDesc.trim() || 'New student innovation venture',
        domain: newDomain.trim() || 'Software',
        problem_statement: newProblem.trim()
      };
      setProjects(prev => [localProj, ...prev]);
      setActiveProject(localProj);
      setShowCreateModal(false);
      setActiveTab('dashboard');
    } finally {
      setCreateLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-bg-main text-text-main flex flex-col lg:flex-row font-sans antialiased">
      
      {/* Sidebar Navigation */}
      <SidebarNav
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onOpenCreateModal={() => setShowCreateModal(true)}
      />

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-24 lg:pb-12 overflow-x-hidden">
        <AnimatePresence mode="wait">
          
          {activeTab === 'landing' && (
            <motion.div key="landing" {...pageTransition}>
              <LandingPage 
                setActiveTab={setActiveTab} 
                onOpenCreateModal={() => setShowCreateModal(true)} 
              />
            </motion.div>
          )}

          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" {...pageTransition}>
              <Dashboard
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onCreateProject={handleCreateProject}
                setActiveTab={setActiveTab}
                onOpenCreateModal={() => setShowCreateModal(true)}
              />
            </motion.div>
          )}

          {activeTab === 'ideas' && (
            <motion.div key="ideas" {...pageTransition}>
              <IdeaCreation
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                setActiveTab={setActiveTab}
                onRefreshProjects={fetchProjects}
              />
            </motion.div>
          )}

          {activeTab === 'advisor' && (
            <motion.div key="advisor" {...pageTransition}>
              <InnovationAdvisor
                activeProject={activeProject}
                setActiveTab={setActiveTab}
                onRefreshJourney={fetchProjects}
              />
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div key="research" {...pageTransition}>
              <ResearchGap
                activeProject={activeProject}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'teams' && (
            <motion.div key="teams" {...pageTransition}>
              <TeamFormation
                activeProject={activeProject}
              />
            </motion.div>
          )}

          {activeTab === 'projects' && (
            <motion.div key="projects" {...pageTransition}>
              <ProjectWorkspace
                activeProject={activeProject}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'mentors' && (
            <motion.div key="mentors" {...pageTransition}>
              <MentorMarketplace
                activeProject={activeProject}
              />
            </motion.div>
          )}

          {activeTab === 'opportunities' && (
            <motion.div key="opportunities" {...pageTransition}>
              <FundingIncubation
                activeProject={activeProject}
              />
            </motion.div>
          )}

          {activeTab === 'pitch' && (
            <motion.div key="pitch" {...pageTransition}>
              <PitchStudio
                activeProject={activeProject}
              />
            </motion.div>
          )}

          {activeTab === 'achievements' && (
            <motion.div key="achievements" {...pageTransition}>
              <Gamification />
            </motion.div>
          )}

          {activeTab === 'readiness' && (
            <motion.div key="readiness" {...pageTransition}>
              <ProjectReadiness
                activeProject={activeProject}
                setActiveTab={setActiveTab}
                onRefreshJourney={fetchProjects}
              />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div key="settings" {...pageTransition}>
              <SettingsPage />
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* CREATE PROJECT MODAL */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 8 }}
              className="brutal-card-lg p-6 sm:p-8 max-w-md w-full bg-pure-white border-3 border-border-dark space-y-6 relative"
            >
              <div className="flex justify-between items-center border-b-2 border-border-dark pb-3">
                <h2 className="text-xl font-extrabold font-heading text-text-main flex items-center gap-2">
                  <FolderPlus className="w-5 h-5 text-deep-green" />
                  <span>Create Innovation Project</span>
                </h2>
                <button 
                  onClick={() => setShowCreateModal(false)}
                  className="p-1 rounded-lg hover:bg-bg-main border border-border-dark"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateProject} className="space-y-4">
                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase">Project Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Smart Campus Waste Management"
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    className="brutal-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase">Domain / Category</label>
                  <input
                    type="text"
                    placeholder="e.g. IoT / Environmental Tech"
                    value={newDomain}
                    onChange={(e) => setNewDomain(e.target.value)}
                    className="brutal-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase">Problem Statement</label>
                  <textarea
                    rows={2}
                    placeholder="What problem does your project solve?"
                    value={newProblem}
                    onChange={(e) => setNewProblem(e.target.value)}
                    className="brutal-input text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block text-xs font-extrabold uppercase">Brief Description</label>
                  <textarea
                    rows={2}
                    placeholder="Overview of your solution..."
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    className="brutal-input text-xs"
                  />
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="brutal-btn brutal-btn-white text-xs py-2.5 flex-1"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createLoading}
                    className="brutal-btn brutal-btn-primary text-xs py-2.5 flex-1"
                  >
                    {createLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Project</span>}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

const App = () => (
  <ToastProvider>
    <MotionConfig transition={{ duration: 0.18, ease: 'easeOut' }}>
      <AppContent />
    </MotionConfig>
  </ToastProvider>
);

export default App;
