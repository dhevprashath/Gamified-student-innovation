import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Dashboard from './pages/Dashboard';
import InnovationAdvisor from './pages/InnovationAdvisor';
import ResearchGap from './pages/ResearchGap';
import InnovationJourney from './pages/InnovationJourney';
import ProjectReadiness from './pages/ProjectReadiness';
import { getProjects, createProject } from './services/api';
import { ToastProvider } from './context/ToastContext';

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
    <div className="min-h-screen bg-[#F7F6F2] text-[#171717] flex flex-col font-sans selection:bg-[#E58A4E] selection:text-white transition-colors">
      
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
        <div key={activeTab} className="animate-page-enter">
          {activeTab === 'dashboard' && (
            <Dashboard
              projects={projects}
              activeProject={activeProject}
              onSelectProject={setActiveProject}
              onCreateProject={handleCreateProject}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'advisor' && (
            <InnovationAdvisor
              activeProject={activeProject}
              onRefreshJourney={fetchProjects}
            />
          )}

          {activeTab === 'research' && (
            <ResearchGap
              activeProject={activeProject}
              onRefreshJourney={fetchProjects}
            />
          )}

          {activeTab === 'journey' && (
            <InnovationJourney
              activeProject={activeProject}
            />
          )}

          {activeTab === 'readiness' && (
            <ProjectReadiness
              activeProject={activeProject}
              onRefreshJourney={fetchProjects}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#E5E3DD] py-6 transition-colors">
        <div className="max-w-7xl mx-auto px-4 text-center text-xs text-[#6B6B65]">
          <p>Gamified Student Innovation Platform — Handcrafted Premium Visual Experience</p>
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
