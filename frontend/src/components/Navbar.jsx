import React from 'react';
import { LayoutDashboard, Lightbulb, Search, Trophy, Rocket, Sparkles, FolderPlus } from 'lucide-react';

const Navbar = ({ activeTab, setActiveTab, projects = [], activeProject, onSelectProject, onCreateProjectModal }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'advisor', label: 'AI Advisor', icon: Lightbulb },
    { id: 'research', label: 'Research Gap', icon: Search },
    { id: 'journey', label: 'Innovation Journey', icon: Trophy },
    { id: 'readiness', label: 'Project Readiness', icon: Rocket },
  ];

  return (
    <header className="bg-white/95 backdrop-blur-md border-b border-[#E5E3DD] sticky top-0 z-50 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo */}
          <div
            className="flex items-center space-x-3 cursor-pointer group"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-9 h-9 rounded-xl bg-[#E58A4E] flex items-center justify-center text-white shadow-xs transition-transform group-hover:scale-105">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <div>
              <span className="text-lg font-black text-[#171717] tracking-tight">
                InnoQuest
              </span>
              <span className="block text-[9px] uppercase tracking-widest text-[#6B6B65] font-semibold">
                Student Innovation Platform
              </span>
            </div>
          </div>

          {/* Project Selector & Actions */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <div className="relative inline-block text-left">
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === Number(e.target.value));
                  if (p) onSelectProject(p);
                }}
                className="bg-[#F7F6F2] border border-[#E5E3DD] text-[#171717] text-xs font-semibold rounded-xl px-3 py-2 focus:outline-none focus:border-[#E58A4E] cursor-pointer max-w-[210px] truncate shadow-xs transition-colors hover:border-[#C8C5BD]"
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
              className="p-2 rounded-xl bg-[#E58A4E] text-white hover:bg-[#D4793D] btn-primary-effect shadow-xs transition-all flex items-center space-x-1.5 text-xs font-semibold"
              title="Create New Project"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden lg:inline">New Project</span>
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`nav-item-effect relative flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-[#E58A4E] text-white shadow-xs'
                      : 'text-[#6B6B65] hover:text-[#171717] hover:bg-[#F7F6F2]'
                  }`}
                >
                  <Icon className={`nav-icon w-4 h-4 transition-transform ${isActive ? 'text-white' : 'text-[#6B6B65]'}`} />
                  <span>{item.label}</span>
                  {isActive && (
                    <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white opacity-80" />
                  )}
                </button>
              );
            })}
          </nav>

        </div>

        {/* Mobile Subnav */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-2 border-t border-[#E5E3DD] scrollbar-none">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive ? 'bg-[#E58A4E] text-white' : 'text-[#6B6B65] bg-[#F7F6F2]'
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
