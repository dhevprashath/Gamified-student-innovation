import React, { useState, useEffect } from 'react';
import { Lightbulb, Sparkles, CheckCircle2, AlertTriangle, Cpu, Rocket, Compass, Loader2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import RiskBadge from '../components/RiskBadge';
import CircularProgress from '../components/CircularProgress';
import { AIAdvisorSkeleton } from '../components/SkeletonLoader';
import { analyzeInnovation, getInnovationAnalysis } from '../services/api';
import { useToast } from '../context/ToastContext';

const AI_STEPS = [
  'Analyzing your innovation...',
  'Evaluating feasibility...',
  'Preparing recommendations...'
];

const InnovationAdvisor = ({ activeProject, onRefreshJourney }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    project_title: activeProject?.title || '',
    problem_statement: activeProject?.problem_statement || '',
    proposed_solution: activeProject?.description || '',
    target_users: activeProject?.target_users || '',
    technology_domain: activeProject?.domain || '',
    expected_impact: activeProject?.expected_impact || '',
  });

  const [loading, setLoading] = useState(false);
  const [stepIndex, setStepIndex] = useState(0);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [analysisRecord, setAnalysisRecord] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      setFormData({
        project_title: activeProject.title || '',
        problem_statement: activeProject.problem_statement || '',
        proposed_solution: activeProject.description || '',
        target_users: activeProject.target_users || '',
        technology_domain: activeProject.domain || '',
        expected_impact: activeProject.expected_impact || '',
      });
      loadExistingAnalysis(activeProject.id);
    }
  }, [activeProject]);

  useEffect(() => {
    let interval;
    if (loading) {
      setStepIndex(0);
      interval = setInterval(() => {
        setStepIndex((prev) => (prev < AI_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [loading]);

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
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
      return;
    }
    if (!formData.project_title || !formData.problem_statement || !formData.proposed_solution) {
      setError('Please fill in required fields (Title, Problem Statement, Proposed Solution).');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
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
      
      addToast({
        title: 'Innovation Analysis Completed',
        description: `Generated score ${res?.analysis_data?.innovation_score}/100 for ${formData.project_title}`,
        type: 'achievement',
        xpBonus: 75
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze innovation idea. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
    } finally {
      setLoading(false);
    }
  };

  const data = analysisRecord?.analysis_data;

  return (
    <div className="space-y-8 animate-page-enter">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold mb-2">
          <Lightbulb className="w-3.5 h-3.5" />
          <span>Module 1 — AI Innovation Advisor</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">AI Innovation Advisor</h1>
        <p className="text-[#6B6B65] text-sm mt-1">
          Evaluate your student innovation across 7 core metrics, assess risks, and receive tailored technical and MVP recommendations.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className={`lg:col-span-5 bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs h-fit ${isShaking ? 'animate-shake' : ''}`}>
          <h2 className="text-lg font-bold text-[#171717] mb-4 flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#E58A4E]" />
            <span>Enter Innovation Details</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Project Title *</label>
              <input
                type="text"
                required
                placeholder="e.g. IoT Smart Waste Tracker"
                value={formData.project_title}
                onChange={(e) => { setFormData({ ...formData, project_title: e.target.value }); setError(null); }}
                className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Problem Statement *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the exact problem your target users encounter..."
                value={formData.problem_statement}
                onChange={(e) => { setFormData({ ...formData, problem_statement: e.target.value }); setError(null); }}
                className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Proposed Solution *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe how your technology solves this problem..."
                value={formData.proposed_solution}
                onChange={(e) => { setFormData({ ...formData, proposed_solution: e.target.value }); setError(null); }}
                className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#171717] mb-1">Target Users</label>
              <input
                type="text"
                placeholder="e.g. Municipalities, Campus Operations"
                value={formData.target_users}
                onChange={(e) => setFormData({ ...formData, target_users: e.target.value })}
                className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Technology / Domain</label>
                <input
                  type="text"
                  placeholder="e.g. IoT, React, AI"
                  value={formData.technology_domain}
                  onChange={(e) => setFormData({ ...formData, technology_domain: e.target.value })}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#171717] mb-1">Expected Impact</label>
                <input
                  type="text"
                  placeholder="e.g. 30% fuel savings"
                  value={formData.expected_impact}
                  onChange={(e) => setFormData({ ...formData, expected_impact: e.target.value })}
                  className="w-full bg-[#F7F6F2] border border-[#E5E3DD] focus:border-[#E58A4E] rounded-xl px-3.5 py-2.5 text-xs text-[#171717] placeholder-[#6B6B65] focus:outline-none transition-colors"
                />
              </div>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#E58A4E] hover:bg-[#D4793D] text-white font-bold rounded-xl text-xs sm:text-sm btn-primary-effect shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span className="animate-fade-in key={stepIndex}">{AI_STEPS[stepIndex]}</span>
                </div>
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
          
          {loading || fetching ? (
            <AIAdvisorSkeleton />
          ) : !data ? (
            <div className="bg-white border border-dashed border-[#E5E3DD] rounded-3xl p-12 text-center text-[#6B6B65]">
              <Lightbulb className="w-12 h-12 text-[#6B6B65] mx-auto mb-3" />
              <h3 className="text-base font-bold text-[#171717]">No Innovation Analysis Found</h3>
              <p className="text-xs text-[#6B6B65] mt-1 max-w-sm mx-auto">
                Fill in the innovation details on the left and click "Analyze Idea" to generate your AI score breakdown.
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-page-enter">
              
              {/* Overall Score & Risk Badge Header */}
              <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-[#E58A4E] uppercase tracking-widest">Analysis Results</span>
                    <h2 className="text-xl font-black text-[#171717] mt-0.5">{analysisRecord.project_title}</h2>
                    <p className="text-xs text-[#6B6B65] mt-1">Evaluated on {new Date(analysisRecord.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="flex items-center space-x-4">
                    <RiskBadge risk={data.overall_risk} />
                    <CircularProgress
                      score={data.innovation_score}
                      maxScore={100}
                      size={80}
                      strokeWidth={7}
                      label="Innovation Score"
                      color="orange"
                    />
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-[#E5E3DD] text-xs text-[#171717] leading-relaxed bg-[#F7F6F2] p-4 rounded-xl border border-[#E5E3DD]">
                  <span className="font-bold text-[#E58A4E]">AI Recommendation: </span>
                  {data.recommendation}
                </div>
              </div>

              {/* 6 Sub-Scores Grid */}
              <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-[#171717] uppercase tracking-wider">Detailed Metric Breakdown</h3>

                <div className="grid sm:grid-cols-2 gap-4">
                  <ProgressBar label="Problem Clarity" value={data.problem_clarity} color="orange" />
                  <ProgressBar label="Technical Feasibility" value={data.technical_feasibility} color="orange" />
                  <ProgressBar label="Market Potential" value={data.market_potential} color="orange" />
                  <ProgressBar label="Financial Feasibility" value={data.financial_feasibility} color="orange" />
                  <ProgressBar label="Ethical Score" value={data.ethical_score} color="orange" />
                  <ProgressBar label="Privacy & Security Score" value={data.privacy_security_score} color="orange" />
                </div>
              </div>

              {/* Strengths & Weaknesses */}
              <div className="grid sm:grid-cols-2 gap-4">
                
                {/* Strengths */}
                <div className="bg-white border border-[#E58A4E]/30 rounded-3xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-[#E58A4E] flex items-center space-x-2 mb-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Identified Strengths</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#171717]">
                    {data.strengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-[#E58A4E] font-bold">•</span>
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Weaknesses */}
                <div className="bg-white border border-[#E58A4E]/30 rounded-3xl p-5 shadow-xs">
                  <h3 className="text-xs font-bold text-[#E58A4E] flex items-center space-x-2 mb-3">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Identified Weaknesses & Risks</span>
                  </h3>
                  <ul className="space-y-2 text-xs text-[#171717]">
                    {data.weaknesses?.map((wk, idx) => (
                      <li key={idx} className="flex items-start space-x-2">
                        <span className="text-[#E58A4E] font-bold">•</span>
                        <span>{wk}</span>
                      </li>
                    ))}
                  </ul>
                </div>

              </div>

              {/* Improvements & Tech Stack */}
              <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-5">
                <div>
                  <h3 className="text-xs font-bold text-[#E58A4E] flex items-center space-x-2 mb-3">
                    <Compass className="w-4 h-4" />
                    <span>Improvement Suggestions</span>
                  </h3>
                  <div className="space-y-2">
                    {data.improvements?.map((imp, idx) => (
                      <div key={idx} className="flex items-start space-x-3 bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E3DD] text-xs text-[#171717]">
                        <span className="w-5 h-5 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{imp}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#E5E3DD] grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-[#171717] flex items-center space-x-2 mb-2">
                      <Cpu className="w-4 h-4 text-[#E58A4E]" />
                      <span>Recommended Tech Stack</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#171717]">
                      {data.recommended_technologies?.map((tech, idx) => (
                        <li key={idx} className="bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-xs font-medium">
                          {tech}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-[#171717] flex items-center space-x-2 mb-2">
                      <Rocket className="w-4 h-4 text-[#E58A4E]" />
                      <span>MVP Feature Suggestions</span>
                    </h3>
                    <ul className="space-y-1.5 text-xs text-[#171717]">
                      {data.mvp_suggestions?.map((mvp, idx) => (
                        <li key={idx} className="bg-[#F7F6F2] px-3 py-1.5 rounded-lg border border-[#E5E3DD] text-xs font-medium">
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
