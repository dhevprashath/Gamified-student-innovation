import React from 'react';
import { LayoutDashboard, Lightbulb, Search, Trophy, Rocket, Sparkles, FolderPlus } from 'lucide-react';
import { motion } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

const Navbar = ({ activeTab, setActiveTab, projects = [], activeProject, onSelectProject, onCreateProjectModal }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'advisor',   label: 'AI Advisor',         icon: Lightbulb },
    { id: 'research',  label: 'Research Gap',        icon: Search },
    { id: 'journey',   label: 'Innovation Journey',  icon: Trophy },
    { id: 'readiness', label: 'Project Readiness',   icon: Rocket },
  ];

  return (
    <header className="bg-surface/95 backdrop-blur-md border-b border-border sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">

          {/* ── Brand ── */}
          <div
            className="flex items-center space-x-3 cursor-pointer group shrink-0"
            onClick={() => setActiveTab('dashboard')}
          >
            <motion.div
              whileHover={{ scale: 1.1, rotate: 6 }}
              whileTap={{ scale: 0.93 }}
              className="w-9 h-9 rounded-2xl bg-primary flex items-center justify-center text-on-primary shadow-warm"
            >
              <Sparkles className="w-5 h-5" />
            </motion.div>
            <div>
              <span className="text-lg font-black text-text tracking-tight leading-tight">InnoQuest</span>
              <span className="block text-[9px] uppercase tracking-widest text-muted font-bold">Student Innovation Platform</span>
            </div>
          </div>

          {/* ── Project Selector & New Project ── */}
          <div className="hidden sm:flex items-center space-x-2.5">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const p = projects.find(proj => proj.id === Number(e.target.value));
                if (p) onSelectProject(p);
              }}
              className="bg-bg border border-border text-text text-xs font-bold rounded-xl px-3 py-2 focus:border-primary cursor-pointer max-w-[200px] truncate shadow-warm hover:border-primary/50 transition-colors"
            >
              {projects.map((proj) => (
                <option key={proj.id} value={proj.id} className="bg-surface text-text">
                  📁 {proj.title}
                </option>
              ))}
            </select>

            <motion.button
              onClick={onCreateProjectModal}
              whileHover={{ scale: 1.05, y: -1 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 rounded-xl bg-primary text-on-primary btn-primary-effect shadow-warm flex items-center space-x-1.5 text-xs font-bold cursor-pointer"
              title="Create New Project"
            >
              <FolderPlus className="w-4 h-4" />
              <span className="hidden lg:inline">New Project</span>
            </motion.button>
          </div>

          {/* ── Desktop Nav + Theme Toggle ── */}
          <div className="flex items-center space-x-1">
            <nav className="hidden md:flex items-center space-x-0.5 relative">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`nav-item-effect relative flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer z-10 ${
                      isActive ? 'text-on-primary' : 'text-muted hover:text-text'
                    }`}
                  >
                    {/* Animated active pill */}
                    {isActive && (
                      <motion.span
                        layoutId="activeNavPill"
                        className="absolute inset-0 bg-primary rounded-xl -z-10"
                        transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      />
                    )}
                    <Icon className={`nav-icon w-3.5 h-3.5 transition-transform ${isActive ? 'text-on-primary' : 'text-muted'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="ml-2">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* ── Mobile subnav ── */}
        <div className="md:hidden flex overflow-x-auto py-2 space-x-1.5 border-t border-border scrollbar-none relative">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors z-10 cursor-pointer ${
                  isActive ? 'text-on-primary' : 'text-muted bg-bg'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="activeNavPillMobile"
                    className="absolute inset-0 bg-primary rounded-xl -z-10"
                    transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                  />
                )}
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
