import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Layers, AlertCircle, ArrowDown, HelpCircle, GitBranch, Loader2 } from 'lucide-react';
import { analyzeResearchGap, getResearchGap } from '../services/api';

const ResearchGap = ({ activeProject, onRefreshJourney }) => {
  const [formData, setFormData] = useState({
    research_topic: activeProject?.title || '',
    problem_area: '',
    existing_solution: '',
    target_domain: activeProject?.domain || '',
  });

  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);
  const [error, setError] = useState(null);
  const [gapRecord, setGapRecord] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      setFormData(prev => ({
        ...prev,
        research_topic: activeProject.title,
        target_domain: activeProject.domain || prev.target_domain,
      }));
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
      return;
    }
    if (!formData.research_topic || !formData.problem_area) {
      setError('Please fill in required fields (Research Topic, Problem Area).');
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
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze research gap. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const data = gapRecord?.gap_data;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-800 to-slate-900 border border-teal-500/30 rounded-3xl p-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-2">
          <Search className="w-3.5 h-3.5" />
          <span>Module 2 — AI Research Gap Finder</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Research Gap Finder</h1>
        <p className="text-slate-400 text-sm mt-1">
          Uncover unaddressed academic and literature gaps, identify existing limitations, and ground your innovation in sound research context.
        </p>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        
        {/* Form Column */}
        <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-3xl p-6 shadow-lg h-fit">
          <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
            <BookOpen className="w-5 h-5 text-teal-400" />
            <span>Define Research Topic</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Research Topic *</label>
              <input
                type="text"
                required
                placeholder="e.g. Dynamic Urban Waste Route Optimization"
                value={formData.research_topic}
                onChange={(e) => setFormData({ ...formData, research_topic: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Problem Area *</label>
              <textarea
                required
                rows={3}
                placeholder="Describe the research or market problem area you are targeting..."
                value={formData.problem_area}
                onChange={(e) => setFormData({ ...formData, problem_area: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Existing Solution (Optional)</label>
              <textarea
                rows={2}
                placeholder="What existing tools or literature approaches currently attempt to solve this?"
                value={formData.existing_solution}
                onChange={(e) => setFormData({ ...formData, existing_solution: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Target Domain</label>
              <input
                type="text"
                placeholder="e.g. Smart Cities & Logistics"
                value={formData.target_domain}
                onChange={(e) => setFormData({ ...formData, target_domain: e.target.value })}
                className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none"
              />
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Finding Research Gaps...</span>
                </>
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
          
          {fetching ? (
            <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 text-center text-slate-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-teal-400 mb-2" />
              <p className="text-xs">Fetching research gap analysis...</p>
            </div>
          ) : !data ? (
            <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-12 text-center text-slate-400">
              <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-300">No Research Gap Analysis Found</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                Fill in your research topic and problem area on the left and click "Find Research Gap".
              </p>
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">

              {/* Disclaimer Banner */}
              <div className="bg-amber-950/60 border border-amber-800/80 rounded-2xl p-4 flex items-start space-x-3 text-amber-200 text-xs">
                <AlertCircle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Academic Suggestion Disclaimer:</span>
                  <span>AI-generated research gaps are suggestions for exploration and should be independently validated against peer-reviewed academic literature.</span>
                </div>
              </div>

              {/* 4-Step Visual Flow Diagram */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
                <h3 className="text-xs font-extrabold text-teal-400 uppercase tracking-wider">
                  Visual Innovation Pipeline Flow
                </h3>

                <div className="space-y-3 relative">
                  
                  {/* Step 1: Existing Solutions */}
                  <div className="bg-slate-900/90 border border-slate-700/80 p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">Step 1 — Existing Solutions Summary</span>
                    <p className="text-xs text-slate-200 mt-1">{data.existing_solution_summary}</p>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-5 h-5 text-teal-400 animate-bounce" />
                  </div>

                  {/* Step 2: Limitations */}
                  <div className="bg-slate-900/90 border border-amber-900/60 p-4 rounded-2xl">
                    <span className="text-[10px] font-extrabold uppercase text-amber-400">Step 2 — Key Limitations</span>
                    <ul className="mt-1 space-y-1 text-xs text-slate-300">
                      {data.existing_limitations?.map((lim, i) => (
                        <li key={i} className="flex items-start space-x-2">
                          <span className="text-amber-400 font-bold">•</span>
                          <span>{lim}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-5 h-5 text-teal-400 animate-bounce" />
                  </div>

                  {/* Step 3: Research Gap */}
                  <div className="bg-slate-900/90 border border-teal-500/60 p-4 rounded-2xl shadow-lg">
                    <span className="text-[10px] font-extrabold uppercase text-teal-300">Step 3 — Identified Research Gap</span>
                    <p className="text-xs text-teal-100 font-bold mt-1 leading-relaxed">{data.research_gap}</p>
                    <p className="text-[11px] text-slate-400 mt-2">
                      <span className="font-bold text-slate-300">Why it matters: </span>
                      {data.why_gap_matters}
                    </p>
                  </div>

                  <div className="flex justify-center my-1">
                    <ArrowDown className="w-5 h-5 text-teal-400 animate-bounce" />
                  </div>

                  {/* Step 4: Innovation Opportunity */}
                  <div className="bg-gradient-to-r from-teal-950 to-slate-900 border border-emerald-500/60 p-4 rounded-2xl shadow-xl">
                    <span className="text-[10px] font-extrabold uppercase text-emerald-300">Step 4 — Student Innovation Opportunity</span>
                    <p className="text-xs text-emerald-100 font-semibold mt-1">{data.innovation_opportunity}</p>
                  </div>

                </div>
              </div>

              {/* Research Questions & Future Scope */}
              <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 space-y-4">
                <div>
                  <h3 className="text-xs font-bold text-teal-300 flex items-center space-x-2 mb-2">
                    <HelpCircle className="w-4 h-4" />
                    <span>Suggested Research Questions</span>
                  </h3>
                  <ul className="space-y-2">
                    {data.research_questions?.map((q, idx) => (
                      <li key={idx} className="bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-200 flex items-start space-x-2">
                        <span className="text-teal-400 font-bold">Q{idx + 1}:</span>
                        <span>{q}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-slate-700/60 grid sm:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-xs font-bold text-emerald-300 flex items-center space-x-2 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <span>Suggested Project Features</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {data.suggested_features?.map((feat, i) => (
                        <li key={i} className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <h3 className="text-xs font-bold text-purple-300 flex items-center space-x-2 mb-2">
                      <GitBranch className="w-4 h-4" />
                      <span>Future Scope</span>
                    </h3>
                    <ul className="space-y-1 text-xs text-slate-300">
                      {data.future_scope?.map((scope, i) => (
                        <li key={i} className="bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-700">
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
