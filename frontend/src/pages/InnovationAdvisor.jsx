import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, CheckCircle2, AlertTriangle, Cpu, Rocket, ShieldCheck, Compass, Loader2 } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import RiskBadge from '../components/RiskBadge';
import { analyzeInnovation, getInnovationAnalysis } from '../services/api';

const InnovationAdvisor = ({ activeProject, onRefreshJourney }) => {
  const [formData, setFormData] = useState({
    project_title: activeProject?.title || '',
    problem_statement: '',
    proposed_solution: activeProject?.description || '',
    target_users: '',
    technology_domain: activeProject?.domain || '',
    expected_impact: '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [analysisRecord, setAnalysisRecord] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      setFormData(prev => ({
        ...prev,
        project_title: activeProject.title,
        proposed_solution: activeProject.description || prev.proposed_solution,
        technology_domain: activeProject.domain || prev.technology_domain,
      }));
      loadExistingAnalysis(activeProject.id);
    }
  }, [activeProject]);

  const loadExistingAnalysis = async (projectId) => {
    setFetching(true);
    try {
      const data = await getInnovationAnalysis(projectId);
      setAnalysisRecord(data);
    } catch (err) {
      setAnalysisRecord(null);
    } finally {
      setFetching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!activeProject?.id) {
      setError('Please select or create an active project first.');
      return;
    }
    if (!formData.project_title || !formData.problem_statement || !formData.proposed_solution) {
      setError('Please fill in required fields (Title, Problem Statement, Proposed Solution).');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeInnovation({
        ...formData,
        project_id: activeProject.id,
      });
      setAnalysisRecord(res);
      if (onRefreshJourney) onRefreshJourney();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze innovation idea. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const data = analysisRecord?.analysis_data;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-indigo-900/60 via-slate-800 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-semibold mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Module 1 — AI Innovation Advisor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">AI Innovation Advisor Page</h1>
        <p className="text-slate-400 text-sm mt-1">
          Evaluate your student innovation across 7 core metrics, assess risks, and receive tailored technical and MVP recommendations.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-lg h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span>Enter Innovation Details</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. IoT Smart Waste Tracker"
                value={formData.project_title}
                onChange={(e) => setFormData({ ...formData, project_title: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Problem Statement *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the exact problem your target users encounter..."
                value={formData.problem_statement}
                onChange={(e) => setFormData({ ...formData, problem_statement: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Proposed Solution *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe how your technology solves this problem..."
                value={formData.proposed_solution}
                onChange={(e) => setFormData({ ...formData, proposed_solution: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Users</label>
              <input
                type="text"
                placeholder="e.g. Municipalities, Campus Operations"
                value={formData.target_users}
                onChange={(e) => setFormData({ ...formData, target_users: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Technology / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. IoT, React, AI"
                  value={formData.technology_domain}
                  onChange={(e) => setFormData({ ...formData, technology_domain: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Expected Impact</label>
                <input
                  type="text"
                  placeholder="e.g. 30% fuel savings"
                  value={formData.expected_impact}
                  onChange={(e) => setFormData({ ...formData, expected_impact: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-indigo-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Analyzing Idea via AI...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze Idea</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {fetching ? (
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-indigo-400 mb-2" />
              <p className="text-xs">Fetching latest analysis...</p>
            </div>
          ) : !data ? (
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-12 text-center text-slate-400">
              <Lightbulb className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Innovation Analysis Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Fill in the innovation details on the left and click "Analyze Idea" to generate your AI score breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              
              {/* Overall Score & Risk Badge Header */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Analysis Results</span>
                    <h2 className="text-xl font-bold text-white mt-0.5">{analysisRecord.project_title}</h2>
                    <p className="text-xs text-slate-400 mt-1">Evaluated on {new Date(analysisRecord.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-3">
                    <RiskBadge risk={data.overall_risk} />
                    <div className="flex flex-col items-center justify-center bg-indigo-950/80 border border-indigo-700/60 rounded-2xl px-4 py-2">
                      <span className="text-2xl font-black text-indigo-300">{data.innovation_score}</span>
                      <span className="text-[9px] font-bold text-indigo-400 uppercase">Innovation Score</span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-slate-700/60 text-xs text-slate-200 leading-relaxed bg-slate-900/60 p-3.5 rounded-xl border border-slate-800">
                  <span className="font-bold text-indigo-400">AI Recommendation: </span>
                  {data.recommendation}
                </div>
              </div>

              {/* 6 Sub-Scores Grid */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">Detailed Metric Breakdown</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <ProgressBar label="Problem Clarity" value={data.problem_clarity} color="indigo" />
                  <ProgressBar label="Technical Feasibility" value={data.technical_feasibility} color="teal" />
                  <ProgressBar label="Market Potential" value={data.market_potential} color="purple" />
                  <ProgressBar label="Financial Feasibility" value={data.financial_feasibility} color="amber" />
                  <ProgressBar label="Ethical Score" value={data.ethical_score} color="emerald" />
                  <ProgressBar label="Privacy & Security Score" value={data.privacy_security_score} color="blue" />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="bg-slate-800/90 border border-emerald-900/60 rounded-3xl p-5 shadow-lg">
                  <h3 className="text-xs font-bold text-emerald-400 flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {data.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-emerald-400 font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-slate-800/90 border border-amber-900/60 rounded-3xl p-5 shadow-lg">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Weaknesses & Risks</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-slate-300">
                    {data.weaknesses?.map((wk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-amber-400 font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Improvements & Tech Stack */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-indigo-300 flex items-center space-x-2 mb-3">
                    <Compass className="w-4 h-4" />
                    <span>Improvement Suggestions</span>
                  </h3>
                  <div className="space-y-2">
                    {data.improvements?.map((imp, idx) => (
                      <div key={idx} className="flex items-start space-x-3 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-200">
                        <span className="w-5 h-5 rounded-full bg-indigo-900 text-indigo-300 text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-700/60 grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-teal-300 flex items-center space-x-2 mb-2">
                      <Cpu className="w-4 h-4" />
                      <span>Recommended Tech Stack</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {data.recommended_technologies?.map((tech, idx) => (
                        <li key={idx} className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-purple-300 flex items-center space-x-2 mb-2">
                      <Rocket className="w-4 h-4" />
                      <span>MVP Feature Suggestions</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {data.mvp_suggestions?.map((mvp, idx) => (
                        <li key={idx} className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium">
                          {mvp}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>

      </div>

    </div>
  );
};

export default InnovationAdvisor;
