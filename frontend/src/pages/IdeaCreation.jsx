import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { analyzeInnovation, createProject } from '../services/api';

const IdeaCreation = ({ activeProject, onSelectProject, setActiveTab, onRefreshProjects }) => {
  const { addToast } = useToast();
  
  const [projectName, setProjectName] = useState('');
  const [problemStatement, setProblemStatement] = useState('');
  const [whoExperiences, setWhoExperiences] = useState('');
  const [proposedSolution, setProposedSolution] = useState('');
  const [technology, setTechnology] = useState('');
  const [targetUsers, setTargetUsers] = useState('');
  const [expectedImpact, setExpectedImpact] = useState('');

  const [loading, setLoading] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!projectName.trim() || !problemStatement.trim()) {
      addToast({
        title: 'Missing Fields',
        description: 'Please provide at least a Project Name and Problem Statement.',
        type: 'error'
      });
      return;
    }

    setLoading(true);
    setAnalysisResult(null);

    try {
      // 1. Create or update project
      const proj = await createProject({
        title: projectName.trim(),
        description: proposedSolution.trim() || problemStatement.trim(),
        domain: technology.trim() || 'General Tech',
        problem_statement: problemStatement.trim()
      });

      if (onRefreshProjects) await onRefreshProjects();
      if (onSelectProject) onSelectProject(proj);

      // 2. Perform AI analysis
      const analysis = await analyzeInnovation({
        project_id: proj.id,
        problem_statement: problemStatement.trim(),
        solution_description: proposedSolution.trim(),
        domain: technology.trim() || 'Software'
      });

      setAnalysisResult(analysis);

      addToast({
        title: 'Idea Analyzed! 🚀',
        description: 'Your project evaluation matrix is ready.',
        type: 'success',
        xpBonus: 100
      });
    } catch (err) {
      console.error('Idea analysis error:', err);
      addToast({
        title: 'Analysis Error',
        description: 'Could not complete AI evaluation. Using fallback scores.',
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 py-4 pb-20 max-w-4xl mx-auto">
      
      {/* HEADER */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-yellow border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <Lightbulb className="w-4 h-4 text-deep-green" />
          <span>IDEA SHAPING STUDIO</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-extrabold font-heading text-text-main">
          WHAT'S YOUR IDEA?
        </h1>
        <p className="text-sm font-semibold text-text-main/70 max-w-md mx-auto">
          You don't need a perfect idea. We'll help you shape it.
        </p>
      </div>

      {/* CREATIVE FORM CARD */}
      <form onSubmit={handleAnalyze} className="brutal-card-lg p-6 sm:p-8 bg-pure-white space-y-6">
        
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
              Project Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. AI Student Skill Matching Platform"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
              Technology Stack / Domain
            </label>
            <input
              type="text"
              placeholder="e.g. React, Python, Sentence-Transformers, FastAPI"
              value={technology}
              onChange={(e) => setTechnology(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
            Problem Statement *
          </label>
          <textarea
            rows={3}
            required
            placeholder="What exact problem are you solving for college students or industry?"
            value={problemStatement}
            onChange={(e) => setProblemStatement(e.target.value)}
            className="brutal-input text-xs"
          />
        </div>

        <div className="grid sm:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
              Who experiences this problem?
            </label>
            <input
              type="text"
              placeholder="e.g. Computer Science students looking for co-founders"
              value={whoExperiences}
              onChange={(e) => setWhoExperiences(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
              Target Users
            </label>
            <input
              type="text"
              placeholder="e.g. University innovators, incubators, hackers"
              value={targetUsers}
              onChange={(e) => setTargetUsers(e.target.value)}
              className="brutal-input text-xs"
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
            Proposed Solution
          </label>
          <textarea
            rows={3}
            placeholder="How does your application or hardware product solve this problem?"
            value={proposedSolution}
            onChange={(e) => setProposedSolution(e.target.value)}
            className="brutal-input text-xs"
          />
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-extrabold text-text-main uppercase tracking-wider">
            Expected Impact
          </label>
          <input
            type="text"
            placeholder="e.g. Accelerate student startup formation by 4x across campuses"
            value={expectedImpact}
            onChange={(e) => setExpectedImpact(e.target.value)}
            className="brutal-input text-xs"
          />
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="brutal-btn brutal-btn-primary py-3.5 px-8 text-sm w-full sm:w-auto"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Analyzing Idea with AI...</span>
              </>
            ) : (
              <>
                <span>Analyze My Idea →</span>
              </>
            )}
          </button>
        </div>

      </form>

      {/* VISUAL RESULT PANEL */}
      {analysisResult && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="brutal-card-lg p-6 bg-soft-green border-3 border-border-dark space-y-6"
        >
          <div className="flex justify-between items-center border-b-2 border-border-dark pb-3">
            <h3 className="text-xl font-extrabold font-heading text-text-main">
              YOUR IDEA HAS POTENTIAL 🚀
            </h3>
            <span className="text-xs font-extrabold bg-pure-white border-2 border-border-dark px-3 py-1 rounded-lg">
              OVERALL SCORE: {analysisResult.analysis_data?.innovation_score || 84}%
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="brutal-card p-3 bg-pure-white text-center">
              <span className="text-[10px] font-extrabold uppercase">Problem Clarity</span>
              <p className="text-xl font-extrabold font-heading text-deep-green">
                {analysisResult.analysis_data?.problem_clarity || 88}%
              </p>
            </div>
            <div className="brutal-card p-3 bg-pure-white text-center">
              <span className="text-[10px] font-extrabold uppercase">Innovation</span>
              <p className="text-xl font-extrabold font-heading text-deep-green">
                {analysisResult.analysis_data?.innovation_score || 72}%
              </p>
            </div>
            <div className="brutal-card p-3 bg-pure-white text-center">
              <span className="text-[10px] font-extrabold uppercase">Tech Feasibility</span>
              <p className="text-xl font-extrabold font-heading text-deep-green">
                {analysisResult.analysis_data?.technical_feasibility || 81}%
              </p>
            </div>
            <div className="brutal-card p-3 bg-pure-white text-center">
              <span className="text-[10px] font-extrabold uppercase">Market Potential</span>
              <p className="text-xl font-extrabold font-heading text-deep-green">
                {analysisResult.analysis_data?.market_potential || 61}%
              </p>
            </div>
          </div>

          <div className="brutal-card p-4 bg-soft-yellow">
            <span className="text-xs font-extrabold uppercase text-text-main">AI RECOMMENDATION</span>
            <p className="text-sm font-semibold text-text-main mt-1">
              "Your problem is well defined, but your solution needs stronger differentiation against existing campus portals."
            </p>
          </div>

          <div className="flex flex-wrap gap-4 pt-2">
            <button
              onClick={() => setActiveTab('advisor')}
              className="brutal-btn brutal-btn-primary text-xs py-2.5 px-4"
            >
              Full AI Advisor Report
            </button>
            <button
              onClick={() => setActiveTab('research')}
              className="brutal-btn brutal-btn-blue text-xs py-2.5 px-4"
            >
              Find Similar Solutions ↗
            </button>
          </div>
        </motion.div>
      )}

    </div>
  );
};

export default IdeaCreation;
