import React from 'react';
import { LayoutDashboard, Lightbulb, Search, Trophy, Rocket, Sparkles, FolderPlus, ChevronDown } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, projects = [], activeProject, onSelectProject, onCreateProjectModal }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'advisor', label: 'AI Advisor', icon: Lightbulb },
    { id: 'research', label: 'Research Gap', icon: Search },
    { id: 'journey', label: 'Innovation Journey', icon: Trophy },
    { id: 'readiness', label: 'Project Readiness', icon: Rocket },
  ];

  return (
    <header className="bg-slate-900/90 backdrop-blur border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('dashboard')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="text-xl font-extrabold bg-gradient-to-r from-white via-slate-100 to-indigo-300 bg-clip-text text-transparent">
                InnoQuest
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-indigo-400 font-bold">
                Student Innovation MVP
              </span>
            </div>
          </div>

          {/* Project Selector Dropdown */}
          <div className="hidden sm:flex items-center space-x-2">
            <div className="relative inline-block text-left">
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === Number(e.target.value));
                  if (p) onSelectProject(p);
                }}
                className="bg-slate-800 border border-slate-700 text-indigo-300 text-xs font-semibold rounded-xl px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer max-w-[200px] truncate"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    📁 {proj.title}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={onCreateProjectModal}
              className="p-1.5 rounded-xl bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 hover:bg-indigo-600 hover:text-white transition-colors"
              title="Create New Project"
            >
              <FolderPlus className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex space-x-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

        </div>

        {/* Mobile Subnav */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-slate-800 scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap ${
                  isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 bg-slate-800/80'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
};

export default Navbar;
