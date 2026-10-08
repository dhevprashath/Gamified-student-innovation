import React from 'react';
import { Settings, User, Bell, Shield, Database, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const SettingsPage = () => {
  const { addToast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    addToast({
      title: 'Settings Saved',
      description: 'Platform preferences updated successfully.',
      type: 'success'
    });
  };

  return (
    <div className="space-y-8 py-4 pb-20 max-w-4xl mx-auto">
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-lavender border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <Settings className="w-4 h-4 text-deep-green" />
          <span>PLATFORM CONFIGURATION</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-text-main">
          SETTINGS & PREFERENCES
        </h1>
        <p className="text-xs font-semibold text-text-main/70">
          Manage your student profile, API connections, notification preferences, and workspace defaults.
        </p>
      </div>

      <form onSubmit={handleSave} className="brutal-card-lg p-6 sm:p-8 bg-pure-white border-3 border-border-dark space-y-6">
        
        {/* User Info */}
        <div className="space-y-4 border-b-2 border-border-dark pb-6">
          <h2 className="text-lg font-extrabold font-heading text-text-main flex items-center gap-2">
            <User className="w-4 h-4 text-deep-green" /> Student Founder Profile
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-extrabold uppercase">Full Name</label>
              <input type="text" defaultValue="Dhev Prashath" className="brutal-input text-xs" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-extrabold uppercase">University / Campus</label>
              <input type="text" defaultValue="Innovation University" className="brutal-input text-xs" />
            </div>
          </div>
        </div>

        {/* AI & Embeddings */}
        <div className="space-y-4 border-b-2 border-border-dark pb-6">
          <h2 className="text-lg font-extrabold font-heading text-text-main flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-deep-green" /> AI & MiniLM Semantic Engine
          </h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="block text-xs font-extrabold uppercase">Embedding Model</label>
              <input type="text" disabled defaultValue="sentence-transformers/all-MiniLM-L6-v2" className="brutal-input text-xs bg-bg-main" />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-extrabold uppercase">API Backend URL</label>
              <input type="text" defaultValue="http://127.0.0.1:8000/api" className="brutal-input text-xs" />
            </div>
          </div>
        </div>

        <div className="flex justify-end">
          <button type="submit" className="brutal-btn brutal-btn-primary py-3 px-8 text-xs">
            Save Preferences
          </button>
        </div>

      </form>
    </div>
  );
};

export default SettingsPage;
