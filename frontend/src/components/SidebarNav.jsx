import React, { useState } from 'react';
import { 
  Home, 
  LayoutDashboard, 
  Lightbulb, 
  Search, 
  Users, 
  Kanban, 
  UserCheck, 
  Coins, 
  Presentation, 
  Trophy, 
  Rocket, 
  Settings, 
  Plus, 
  Sparkles,
  ChevronDown,
  Menu,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ThemeToggle from './ThemeToggle';

export const NAV_ITEMS = [
  { id: 'landing', label: 'Home', icon: Home, category: 'Main' },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Main' },
  { id: 'ideas', label: 'My Ideas', icon: Lightbulb, category: 'Incubation' },
  { id: 'advisor', label: 'AI Advisor', icon: Sparkles, category: 'Incubation' },
  { id: 'research', label: 'Research', icon: Search, category: 'Incubation' },
  { id: 'teams', label: 'Teams', icon: Users, category: 'Collaboration' },
  { id: 'projects', label: 'Workspace', icon: Kanban, category: 'Collaboration' },
  { id: 'mentors', label: 'Mentors', icon: UserCheck, category: 'Network' },
  { id: 'opportunities', label: 'Opportunities', icon: Coins, category: 'Network' },
  { id: 'pitch', label: 'Pitch Studio', icon: Presentation, category: 'Build' },
  { id: 'achievements', label: 'Achievements', icon: Trophy, category: 'Build' },
  { id: 'readiness', label: 'Progress', icon: Rocket, category: 'Build' },
  { id: 'settings', label: 'Settings', icon: Settings, category: 'System' }
];

const SidebarNav = ({ 
  activeTab, 
  setActiveTab, 
  projects = [], 
  activeProject, 
  onSelectProject,
  onOpenCreateModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="hidden lg:flex flex-col w-64 bg-pure-white border-r-3 border-border-dark min-h-screen sticky top-0 z-40 shrink-0 select-none shadow-[4px_0px_0px_#171717]">
        {/* Brand Header */}
        <div className="p-6 border-b-3 border-border-dark flex items-center justify-between bg-soft-yellow">
          <div 
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-10 h-10 rounded-xl bg-deep-green border-2 border-border-dark text-white flex items-center justify-center font-extrabold shadow-[2px_2px_0px_#171717] group-hover:rotate-6 transition-transform">
              ⚡
            </div>
            <div>
              <h1 className="text-xl font-extrabold tracking-tight text-text-main leading-none font-heading">
                INNOVATE
              </h1>
              <span className="text-[10px] font-bold uppercase tracking-widest text-deep-green block mt-1">
                STUDENT INCUBATOR
              </span>
            </div>
          </div>
        </div>

        {/* Project Selector Box */}
        <div className="p-4 border-b-3 border-border-dark bg-soft-green/30">
          <div className="text-[11px] font-extrabold uppercase tracking-wider text-text-main mb-1.5 flex justify-between items-center">
            <span>ACTIVE PROJECT</span>
            <button 
              onClick={onOpenCreateModal}
              className="text-deep-green hover:underline flex items-center gap-0.5 cursor-pointer"
              title="Create New Project"
            >
              <Plus className="w-3.5 h-3.5" /> New
            </button>
          </div>
          
          <div className="relative">
            <select
              value={activeProject?.id || ''}
              onChange={(e) => {
                const p = projects.find(proj => proj.id === Number(e.target.value));
                if (p) onSelectProject(p);
              }}
              className="w-full brutal-input py-2 text-xs font-bold appearance-none bg-pure-white cursor-pointer pr-8"
            >
              {projects.length === 0 ? (
                <option value="">No Projects Yet</option>
              ) : (
                projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>
                    🚀 {proj.title}
                  </option>
                ))
              )}
            </select>
            <ChevronDown className="w-4 h-4 absolute right-2.5 top-3 pointer-events-none text-text-main" />
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  isActive 
                    ? 'bg-deep-green text-white border-2 border-border-dark shadow-[3px_3px_0px_#171717]' 
                    : 'text-text-main hover:bg-soft-yellow/50 border-2 border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-soft-yellow' : 'text-text-main'}`} />
                  <span>{item.label}</span>
                </div>
                {isActive && (
                  <span className="text-[10px] bg-soft-orange text-text-main px-1.5 py-0.5 rounded border border-border-dark font-extrabold">
                    ●
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User & Theme Footer */}
        <div className="p-4 border-t-3 border-border-dark bg-bg-main flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-soft-pink border-2 border-border-dark flex items-center justify-center font-bold text-xs shadow-[2px_2px_0px_#171717]">
              DP
            </div>
            <div>
              <p className="text-xs font-extrabold text-text-main leading-tight">Dhev Prashath</p>
              <p className="text-[10px] font-bold text-deep-green">Student Founder</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </aside>

      {/* ── MOBILE HEADER & DRAWER ── */}
      <header className="lg:hidden bg-pure-white border-b-3 border-border-dark sticky top-0 z-50 px-4 py-3 flex items-center justify-between shadow-[0px_3px_0px_#171717]">
        <div 
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-lg bg-deep-green border-2 border-border-dark text-white flex items-center justify-center font-bold text-sm">
            ⚡
          </div>
          <span className="font-extrabold font-heading text-lg tracking-tight">INNOVATE</span>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="brutal-btn py-1.5 px-2.5 text-xs bg-soft-yellow"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="lg:hidden fixed inset-x-0 top-14 z-40 bg-pure-white border-b-3 border-border-dark p-4 shadow-[0px_6px_0px_#171717] max-h-[80vh] overflow-y-auto space-y-3"
          >
            <div className="p-3 bg-soft-green/40 border-2 border-border-dark rounded-xl">
              <label className="block text-[11px] font-extrabold uppercase mb-1">Active Project</label>
              <select
                value={activeProject?.id || ''}
                onChange={(e) => {
                  const p = projects.find(proj => proj.id === Number(e.target.value));
                  if (p) onSelectProject(p);
                  setMobileMenuOpen(false);
                }}
                className="w-full brutal-input py-1.5 text-xs font-bold"
              >
                {projects.map((proj) => (
                  <option key={proj.id} value={proj.id}>{proj.title}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-2.5 rounded-xl border-2 font-bold text-xs text-left ${
                      isActive ? 'bg-deep-green text-white border-border-dark' : 'bg-bg-main border-border-dark'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="truncate">{item.label}</span>
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── MOBILE BOTTOM NAV BAR ── */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-pure-white border-t-3 border-border-dark flex justify-around p-2 shadow-[0px_-3px_0px_#171717]">
        {[
          { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
          { id: 'ideas', label: 'Ideas', icon: Lightbulb },
          { id: 'projects', label: 'Build', icon: Kanban },
          { id: 'teams', label: 'Teams', icon: Users },
          { id: 'mentors', label: 'Mentors', icon: UserCheck }
        ].map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center gap-1 p-1.5 rounded-xl font-bold text-[10px] transition-transform ${
                isActive ? 'text-deep-green scale-110' : 'text-text-main opacity-70'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </>
  );
};

export default SidebarNav;
