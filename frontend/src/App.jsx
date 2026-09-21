import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InnovationAdvisor from './pages/InnovationAdvisor';
import ResearchGap from './pages/ResearchGap';
import InnovationJourney from './pages/InnovationJourney';
import ProjectReadiness from './pages/ProjectReadiness';
import { getProjects, createProject } from './services/api';
import { ToastProvider } from './context/ToastContext';

const pageTransition = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -6 },
  transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
};

const AppContent = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [projects, setProjects] = useState([]);
  const [activeProject, setActiveProject] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const data = await getProjects();
      setProjects(data || []);
      if (data && data.length > 0) {
        // Default select first project if activeProject not set or invalid
        if (!activeProject || !data.some(p => p.id === activeProject.id)) {
          setActiveProject(data[0]);
        }
      }
    } catch (err) {
      console.error('Failed to fetch projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (projectData) => {
    const newProj = await createProject(projectData);
    setProjects(prev => [newProj, ...prev]);
    setActiveProject(newProj);
    return newProj;
  };

  return (
    <div className="min-h-screen bg-bg text-text flex flex-col font-sans selection:bg-primary-soft selection:text-primary-deep transition-colors">
      
      {/* Navigation Header */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        projects={projects}
        activeProject={activeProject}
        onSelectProject={setActiveProject}
        onCreateProjectModal={() => setActiveTab('dashboard')}
      />

      {/* Main Page Area with Route Page Transitions */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <AnimatePresence mode="wait">
          {activeTab === 'dashboard' && (
            <motion.div key="dashboard" {...pageTransition}>
              <Dashboard
                projects={projects}
                activeProject={activeProject}
                onSelectProject={setActiveProject}
                onCreateProject={handleCreateProject}
                setActiveTab={setActiveTab}
              />
            </motion.div>
          )}

          {activeTab === 'advisor' && (
            <motion.div key="advisor" {...pageTransition}>
              <InnovationAdvisor
                activeProject={activeProject}
                onRefreshJourney={fetchProjects}
              />
            </motion.div>
          )}

          {activeTab === 'research' && (
            <motion.div key="research" {...pageTransition}>
              <ResearchGap
                activeProject={activeProject}
                onRefreshJourney={fetchProjects}
              />
            </motion.div>
          )}

          {activeTab === 'journey' && (
            <motion.div key="journey" {...pageTransition}>
              <InnovationJourney
                activeProject={activeProject}
              />
            </motion.div>
          )}

          {activeTab === 'readiness' && (
            <motion.div key="readiness" {...pageTransition}>
              <ProjectReadiness
                activeProject={activeProject}
                onRefreshJourney={fetchProjects}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-muted">
          <p>InnoQuest · Sunny Study Edition · Gamified Innovation Platform</p>
        </div>
      </footer>

    </div>
  );
};

const App = () => (
  <ToastProvider>
    <AppContent />
  </ToastProvider>
);

export default App;
