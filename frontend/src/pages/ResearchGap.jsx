import React, { useState, useEffect } from 'react';
import { Search, BookOpen, AlertCircle, ArrowDown, HelpCircle, GitBranch, Sparkles } from 'lucide-react';
import { ResearchGapSkeleton } from '../components/SkeletonLoader';
import { analyzeResearchGap, getResearchGap } from '../services/api';
import { useToast } from '../context/ToastContext';

const ResearchGap = ({ activeProject, onRefreshJourney }) => {
  const { addToast } = useToast();
  const [formData, setFormData] = useState({
    research_topic: activeProject?.title || '',
    problem_area: activeProject?.problem_statement || '',
    existing_solution: '',
    target_domain: activeProject?.domain || '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [isShaking, setIsShaking] = useState(false);
  const [gapRecord, setGapRecord] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      setFormData({
        research_topic: activeProject.title || '',
        problem_area: activeProject.problem_statement || '',
        existing_solution: '',
        target_domain: activeProject.domain || '',
      });
      loadExistingGap(activeProject.id);
    }
  }, [activeProject]);

  const loadExistingGap = async (projectId) => {
    setFetching(true);
    try {
      const data = await getResearchGap(projectId);
      setGapRecord(data);
    } catch (err) {
      setGapRecord(null);
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
    if (!formData.research_topic || !formData.problem_area) {
      setError('Please fill in required fields (Research Topic, Problem Area).');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeResearchGap({
        ...formData,
        project_id: activeProject.id,
      });
      setGapRecord(res);
      if (onRefreshJourney) onRefreshJourney();

      addToast({
        title: 'Research Gap Identified',
        description: `Uncovered literature opportunities for ${formData.research_topic}`,
        type: 'achievement',
        xpBonus: 60
      });
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze research gap. Please try again.');
      setIsShaking(true);
      setTimeout(() => setIsShaking(false), 350);
    } finally {
      setLoading(false);
    }
  };

  const data = gapRecord?.gap_data;

  return (
    <div className="space-y-8 animate-page-enter">
      
      {/* Header Banner */}
      <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary-deep text-xs font-bold mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>Module 2 — AI Research Gap Finder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-text">Research Gap Finder</h1>
        <p className="text-muted text-sm mt-1">
          Uncover unaddressed academic and literature gaps, identify existing limitations, and ground your innovation in sound research context.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className={`lg:col-span-5 bg-surface border border-border rounded-3xl p-6 shadow-xs h-fit ${isShaking ? 'animate-shake' : ''}`}>
          <h2 className="text-lg font-bold text-text mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <span>Define Research Topic</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-text mb-1">Research Topic *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Urban Waste Route Optimization"
                value={formData.research_topic}
                onChange={(e) => { setFormData({ ...formData, research_topic: e.target.value }); setError(null); }}
                className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Problem Area *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the research or market problem area you are targeting..."
                value={formData.problem_area}
                onChange={(e) => { setFormData({ ...formData, problem_area: e.target.value }); setError(null); }}
                className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Existing Solution (Optional)</label>
              <textarea
                rows={2}
                placeholder="What existing tools or literature approaches currently attempt to solve this?"
                value={formData.existing_solution}
                onChange={(e) => setFormData({ ...formData, existing_solution: e.target.value })}
                className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-text mb-1">Target Domain</label>
              <input
                type="text"
                placeholder="e.g. Smart Cities & Logistics"
                value={formData.target_domain}
                onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-xs text-text placeholder-muted transition-colors"
              />
            </div>

            {error && (
              <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-primary hover:opacity-90 text-on-primary font-bold rounded-xl text-xs sm:text-sm btn-primary-effect shadow-xs flex items-center justify-center space-x-2 disabled:opacity-50 transition-all cursor-pointer"
            >
              {loading ? (
                <span>Discovering Research Gaps...</span>
              ) : (
                <>
                  <Search className="w-4 h-4" />
                  <span>Find Research Gap</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results Column */}
        <div className="lg:col-span-7 space-y-6">
          
          {loading || fetching ? (
            <ResearchGapSkeleton />
          ) : !data ? (
            <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center text-muted">
              <Search className="w-12 h-12 text-muted mx-auto mb-3" />
              <h3 className="text-base font-bold text-text">No Research Gap Analysis Found</h3>
              <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                Fill in your research topic and problem area on the left and click "Find Research Gap".
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-page-enter">

              {/* Disclaimer Banner */}
              <div className="bg-primary-soft/50 border border-primary/30 rounded-2xl p-4 flex items-start space-x-3 text-text text-xs">
                <AlertCircle className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-text">Academic Suggestion Disclaimer:</span>
                  <span className="text-muted">AI-generated research gaps are suggestions for exploration and should be independently validated against peer-reviewed academic literature.</span>
                </div>
              </div>

              {/* 4-Step Visual Flow Pipeline */}
              <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
                <h3 className="text-xs font-extrabold text-primary-deep uppercase tracking-wider">
                  Visual Innovation Pipeline Flow
                </h3>

                <div className="space-y-3 relative">
                  
                  {/* Step 1: Existing Solutions */}
                  <div className="bg-bg border border-border p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-muted">Step 1 — Existing Solutions Summary</span>
                    <p className="text-xs text-text mt-1">{data.existing_solution_summary}</p>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-primary" />
                  </div>

                  {/* Step 2: Limitations */}
                  <div className="bg-primary-soft/40 border border-primary/30 p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-primary-deep">Step 2 — Key Limitations</span>
                    <ul className="mt-1 space-y-1 text-xs text-text">
                      {data.existing_limitations?.map((lim, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-primary-deep font-bold">•</span>
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-primary" />
                  </div>

                  {/* Step 3: Research Gap */}
                  <div className="bg-primary-soft border border-primary/30 p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-primary-deep">Step 3 — Identified Research Gap</span>
                    <p className="text-xs text-primary-deep font-bold mt-1 leading-relaxed">{data.research_gap}</p>
                    <p className="text-[11px] text-muted mt-2">
                      <span className="font-bold text-text">Why it matters: </span>
                      {data.why_gap_matters}
                    </p>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-4 h-4 text-primary" />
                  </div>

                  {/* Step 4: Innovation Opportunity */}
                  <div className="bg-primary text-on-primary p-4 rounded-2xl shadow-xs">
                    <span className="text-[10px] font-extrabold uppercase text-on-primary/80">Step 4 — Student Innovation Opportunity</span>
                    <p className="text-xs text-on-primary font-semibold mt-1">{data.innovation_opportunity}</p>
                  </div>

                </div>
              </div>

              {/* Research Questions & Future Scope */}
              <div className="bg-surface border border-border rounded-3xl p-6 shadow-xs space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-primary-deep flex items-center space-x-2 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Suggested Research Questions</span>
                  </h3>
                  <ul className="space-y-2">
                    {data.research_questions?.map((q, idx) => (
                      <li key={idx} className="bg-bg p-3 rounded-xl border border-border text-xs text-text flex items-start space-x-2">
                        <span className="text-primary-deep font-bold">Q{idx + 1}:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-border grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-text flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4 text-primary" />
                      <span>Suggested Project Features</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-text">
                      {data.suggested_features?.map((feat, i) => (
                        <li key={i} className="bg-bg px-3 py-1.5 rounded-lg border border-border">
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-text flex items-center space-x-2 mb-2">
                      <GitBranch className="w-4 h-4 text-primary" />
                      <span>Future Scope</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-text">
                      {data.future_scope?.map((scope, i) => (
                        <li key={i} className="bg-bg px-3 py-1.5 rounded-lg border border-border">
                          {scope}
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

export default ResearchGap;
