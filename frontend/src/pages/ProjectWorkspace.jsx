import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Kanban, 
  CheckSquare, 
  Clock, 
  User, 
  Plus, 
  FileText, 
  Folder, 
  Sparkles, 
  Target, 
  Presentation, 
  Coins, 
  Users, 
  Search, 
  UserCheck 
} from 'lucide-react';
import { useToast } from '../context/ToastContext';

const ProjectWorkspace = ({ activeProject, setActiveTab }) => {
  const { addToast } = useToast();
  const [subTab, setSubTab] = useState('tasks');

  const [tasks, setTasks] = useState([
    {
      id: 'task-1',
      title: 'Conduct prototype validation with 10 campus students',
      priority: 'HIGH',
      assignee: 'Dhev P',
      deadline: '2026-10-15',
      status: 'IN PROGRESS',
      color: 'bg-soft-yellow'
    },
    {
      id: 'task-2',
      title: 'Set up FastAPI backend routes for MiniLM embedding inference',
      priority: 'HIGH',
      assignee: 'Dhev P',
      deadline: '2026-10-10',
      status: 'COMPLETED',
      color: 'bg-soft-green'
    },
    {
      id: 'task-3',
      title: 'Design Neo-Brutalist responsive layout for desktop & mobile',
      priority: 'HIGH',
      assignee: 'Arun K',
      deadline: '2026-10-12',
      status: 'COMPLETED',
      color: 'bg-soft-pink'
    },
    {
      id: 'task-4',
      title: 'Draft 2-minute pitch deck slides for incubator application',
      priority: 'MEDIUM',
      assignee: 'Priya S',
      deadline: '2026-10-18',
      status: 'TO DO',
      color: 'bg-soft-blue'
    },
    {
      id: 'task-5',
      title: 'Submit grant application to Student Innovation Fund',
      priority: 'MEDIUM',
      assignee: 'Rohan M',
      deadline: '2026-10-25',
      status: 'TO DO',
      color: 'bg-soft-lavender'
    }
  ]);

  const [newTaskTitle, setNewTaskTitle] = useState('');

  const toggleTaskStatus = (id) => {
    setTasks((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          const nextStatus =
            t.status === 'TO DO'
              ? 'IN PROGRESS'
              : t.status === 'IN PROGRESS'
              ? 'COMPLETED'
              : 'TO DO';
          return { ...t, status: nextStatus };
        }
        return t;
      })
    );
    addToast({
      title: 'Task Status Updated',
      description: 'Progress updated on your project board.',
      type: 'info'
    });
  };

  const handleAddTask = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    const newTask = {
      id: `task-${Date.now()}`,
      title: newTaskTitle.trim(),
      priority: 'MEDIUM',
      assignee: 'Dhev P',
      deadline: '2026-10-20',
      status: 'TO DO',
      color: 'bg-soft-yellow'
    };
    setTasks((prev) => [...prev, newTask]);
    setNewTaskTitle('');
    addToast({
      title: 'Task Added',
      description: `"${newTask.title}" added to TO DO column.`,
      type: 'success'
    });
  };

  const subTabsList = [
    { id: 'overview', label: 'Overview', icon: Target },
    { id: 'tasks', label: 'Tasks', icon: Kanban },
    { id: 'research', label: 'Research', icon: Search, tabTarget: 'research' },
    { id: 'team', label: 'Team', icon: Users, tabTarget: 'teams' },
    { id: 'files', label: 'Files', icon: FileText },
    { id: 'milestones', label: 'Milestones', icon: Target, tabTarget: 'achievements' },
    { id: 'mentor', label: 'Mentor', icon: UserCheck, tabTarget: 'mentors' },
    { id: 'advisor', label: 'AI Advisor', icon: Sparkles, tabTarget: 'advisor' },
    { id: 'pitch', label: 'Pitch', icon: Presentation, tabTarget: 'pitch' },
    { id: 'funding', label: 'Funding', icon: Coins, tabTarget: 'opportunities' }
  ];

  return (
    <div className="space-y-6 py-4 pb-20 max-w-6xl mx-auto">

      {/* WORKSPACE HEADER */}
      <div className="brutal-card-lg p-6 bg-pure-white border-3 border-border-dark space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b-2 border-border-dark pb-4">
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-soft-lavender border border-border-dark rounded text-[11px] font-extrabold uppercase mb-1">
              <span>STAGE: BUILD & INCUBATION</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-heading text-text-main">
              {activeProject ? activeProject.title : 'AI Student Skill Matching Platform'}
            </h1>
            <p className="text-xs font-semibold text-text-main/70">
              {activeProject?.description || 'Build workspace for managing task sprints, files, research notes, and mentor reviews.'}
            </p>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <span className="text-xs font-extrabold bg-soft-green border-2 border-border-dark px-3 py-1.5 rounded-xl">
              ● SPRINT ACTIVE
            </span>
          </div>
        </div>

        {/* WORKSPACE SUB-NAVIGATION TABS */}
        <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-none">
          {subTabsList.map((st) => {
            const Icon = st.icon;
            const isActive = subTab === st.id;
            return (
              <button
                key={st.id}
                onClick={() => {
                  if (st.tabTarget) {
                    setActiveTab(st.tabTarget);
                  } else {
                    setSubTab(st.id);
                  }
                }}
                className={`brutal-btn py-2 px-3.5 text-xs whitespace-nowrap transition-colors ${
                  isActive ? 'brutal-btn-primary' : 'brutal-btn-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{st.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* QUICK TASK ADD FORM */}
      <form onSubmit={handleAddTask} className="brutal-card p-3 bg-pure-white flex gap-3">
        <input
          type="text"
          placeholder="Add a new task to your sprint..."
          value={newTaskTitle}
          onChange={(e) => setNewTaskTitle(e.target.value)}
          className="brutal-input text-xs py-2"
        />
        <button type="submit" className="brutal-btn brutal-btn-primary text-xs py-2 px-5 shrink-0">
          <Plus className="w-4 h-4" /> Add Task
        </button>
      </form>

      {/* KANBAN BOARD (TO DO, IN PROGRESS, COMPLETED) */}
      <div className="grid md:grid-cols-3 gap-6">
        {['TO DO', 'IN PROGRESS', 'COMPLETED'].map((colStatus) => {
          const colTasks = tasks.filter((t) => t.status === colStatus);
          const colBg =
            colStatus === 'TO DO'
              ? 'bg-soft-blue/30'
              : colStatus === 'IN PROGRESS'
              ? 'bg-soft-yellow/40'
              : 'bg-soft-green/30';

          return (
            <div key={colStatus} className={`brutal-card p-4 ${colBg} border-3 border-border-dark space-y-4`}>
              <div className="flex justify-between items-center border-b-2 border-border-dark pb-2 font-extrabold text-xs">
                <span className="uppercase tracking-wider text-text-main">{colStatus}</span>
                <span className="bg-pure-white border border-border-dark px-2 py-0.5 rounded text-[11px]">
                  {colTasks.length}
                </span>
              </div>

              <div className="space-y-3">
                {colTasks.map((t) => (
                  <div
                    key={t.id}
                    className={`brutal-card p-4 ${t.color} space-y-3 cursor-pointer brutal-card-hover`}
                    onClick={() => toggleTaskStatus(t.id)}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-xs font-bold text-text-main leading-snug">
                        {t.title}
                      </p>
                      <span className="text-xs">
                        {colStatus === 'COMPLETED' ? '☑' : '☐'}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] font-extrabold text-text-main/80 pt-2 border-t border-border-dark/20">
                      <span className="bg-pure-white border border-border-dark px-1.5 py-0.5 rounded">
                        {t.priority}
                      </span>
                      <span>Assignee: {t.assignee}</span>
                      <span>Due: {t.deadline}</span>
                    </div>
                  </div>
                ))}

                {colTasks.length === 0 && (
                  <div className="p-4 text-center text-xs font-semibold text-text-main/50 border-2 border-dashed border-border-dark rounded-xl">
                    No tasks in {colStatus.toLowerCase()}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default ProjectWorkspace;
