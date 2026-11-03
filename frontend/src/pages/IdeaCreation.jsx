import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, ArrowRight, Loader2, Lightbulb } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { analyzeInnovation, createProject } from '../services/api';

// ── Local default analysis: used only if the AI service fails, so the user
//    always sees relevant content instead of an error or an empty area. ──
const buildDefaultAnalysis = (name, problem, solution, users, tech, impact) => {
  const text = `${problem} ${solution} ${tech}`.toLowerCase();
  const p = (k) => (text.includes(k) ? 14 : 0);
  const complexity = /robot|iot|sensor|hardware|drone|model|blockchain|quantum/.test(text) ? 14 : 0;

  const scores = {
    problem_clarity: Math.min(92, 55 + Math.min(2, (problem || '').split(/\s+/).length / 10 | 0) * 12),
    technical_feasibility: Math.min(90, 82 - complexity + p('react') + p('python') + p('fastapi') + p('api')),
    market_potential: /student|campus|colleg|farm|patient|elder|disab/.test(text) ? 74 : 62,
    financial_feasibility: /hardware|robot|satellite|fusion/.test(text) ? 58 : 80,
    ethical_score: /health|edu|sustain|farm|safety|disab|environment|waste/.test(text) ? 84 : 66,
    privacy_security_score: /face|biometric|surveille|track|location/.test(text) ? 55 : 78,
  };
  const overall = Math.round(
    (scores.problem_clarity + scores.technical_feasibility + scores.market_potential +
      scores.financial_feasibility + scores.ethical_score + scores.privacy_security_score) / 6
  );
  const names = (n) => (Array.isArray(n) ? n : []).slice(0, 5);

  return {
    analysis_data: {
      innovation_score: overall,
      ...scores,
      overall_risk: overall >= 72 ? 'Low' : overall >= 50 ? 'Medium' : 'High',
      recommendation: solution && solution.trim()
        ? `'${name}' targets a real problem for ${users || 'your users'}. Sharpens its edge by validating the core need with 10+ ${users || 'target users'} before scaling features beyond the MVP.`
        : `'${name}' has a clearly framed problem. Add a concrete "how we solve it" (proposed solution) so the AI can properly judge the approach.`,
      strengths: [
        `Problem framed around ${users || 'a defined user group'} — good target specificity.`,
        tech ? `Technology direction noted (${tech}).` : 'Open to flexible technology choices.',
      ],
      weaknesses: [
        solution && solution.trim() ? 'Differentiation vs. existing solutions is not yet quantified.' : 'No proposed solution yet — the evaluation cannot judge approach quality.',
        'Market and cost assumptions need validation with real data.',
      ],
      improvements: [
        'Add quantified evidence of the problem (numbers, affected group size, current cost).',
        'Define a testable MVP: smallest feature set that proves the core value.',
      ],
      recommended_technologies: tech ? [tech].concat(['FastAPI', 'React', 'MySQL']) : ['React', 'FastAPI', 'MySQL'],
      mvp_suggestions: [
        `Build a simple ${text.includes('dashboard') ? 'dashboard' : 'workflow'} around the single most painful step identified in the problem statement.`,
        'Collect real-user feedback from a pilot of at least 10 users.',
        'Track and display one measurable impact metric (matching the stated impact).',
      ],
      is_fallback: true,
    },
  };
};

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
        project_title: projectName.trim(),
        problem_statement: problemStatement.trim(),
        proposed_solution: proposedSolution.trim() || problemStatement.trim(),
        target_users: targetUsers.trim() || whoExperiences.trim() || 'Student innovators & target end-users',
        technology_domain: technology.trim() || 'Software',
        expected_impact: expectedImpact.trim() || ''
      });

      setAnalysisResult(analysis);

      addToast({
        title: 'Idea Analyzed! 🚀',
        description: 'Your project evaluation matrix is ready.',
        type: 'success',
        xpBonus: 100
      });
    } catch (err) {
      console.warn('AI analysis unavailable, using locally generated evaluation for:', projectName.trim(), err);
      // AI errored (or was unreachable) -> show locally generated default
      // content related to the entered problem. Never an error screens or
      // an empty area.
      setAnalysisResult(buildDefaultAnalysis(
        projectName.trim(),
        problemStatement.trim(),
        proposedSolution.trim(),
        (targetUsers.trim() || whoExperiences.trim()),
        technology.trim(),
        expectedImpact.trim()
      ));
      addToast({
        title: 'Idea Analyzed! 🚀',
        description: 'AI was briefly unavailable, so we generated an instant starter evaluation for you. Re-analyze later for full AI scoring.',
        type: 'info',
        xpBonus: 25
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
              OVERALL SCORE: {analysisResult.analysis_data?.innovation_score || 72}%
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
              "{analysisResult.analysis_data?.recommendation ||
                'Your problem is well defined, but your solution needs stronger differentiation against existing solutions.'}"
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
