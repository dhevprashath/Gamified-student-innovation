import React, { useState, useEffect } from 'react';
import { Search, Sparkles, BookOpen, Layers, HelpCircle, GitBranch, History, Loader2 } from 'lucide-react';
import { analyzeGaps, getResearchHistory } from '../services/api';

const ResearchGapFinder = ({ onQuestComplete }) => {
  const [formData, setFormData] = useState({
    domain: '',
    topic: '',
    abstract_text: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    try {
      const data = await getResearchHistory();
      setHistory(data || []);
    } catch (err) {
      console.error('Failed to load research history:', err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.domain || !formData.topic) return;

    setLoading(true);
    setError(null);
    try {
      const res = await analyzeGaps(formData);
      setResult(res);
      loadHistory();
      if (onQuestComplete) {
        onQuestComplete('val_1', 100);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze research gaps. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const analysis = result?.analysis_result;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-800 to-slate-900 border border-teal-500/30 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/30 text-teal-400 text-xs font-semibold mb-2">
              <Search className="w-3.5 h-3.5" />
              <span>Module 2 — AI Research Gap Finder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white">Literature & Research Gap Finder</h1>
            <p className="text-slate-400 text-sm mt-1">
              Identify unaddressed research problems, novel subdomains, and concrete research questions to ground your innovation project.
            </p>
          </div>
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:bg-slate-700 text-slate-300 text-xs font-medium self-start md:self-auto transition-colors"
          >
            <History className="w-4 h-4 text-teal-400" />
            <span>{showHistory ? 'Back to Form' : `History (${history.length})`}</span>
          </button>
        </div>
      </div>

      {showHistory ? (
        /* History View */
        <div className="bg-slate-800/60 border border-slate-700 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-white mb-4">Past Research Analyses</h2>
          {history.length === 0 ? (
            <p className="text-slate-400 text-sm">No previous gap searches found.</p>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {history.map((item) => (
                <div 
                  key={item.id}
                  onClick={() => { setResult(item); setShowHistory(false); }}
                  className="bg-slate-900/80 border border-slate-700 hover:border-teal-500/50 rounded-xl p-4 cursor-pointer transition-all"
                >
                  <div className="flex justify-between items-start">
                    <h3 className="font-semibold text-teal-300 text-sm">{item.topic}</h3>
                    <span className="text-[10px] bg-teal-950 text-teal-400 px-2 py-0.5 rounded border border-teal-800">
                      {item.domain}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-2 line-clamp-2">{item.abstract_text || 'No abstract text'}</p>
                  <div className="text-[10px] text-slate-500 mt-3">
                    {new Date(item.created_at).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        /* Main Gap Finder Form & Results */
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Input Form */}
          <div className="lg:col-span-5 bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg h-fit">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-teal-400" />
              <span>Define Research Topic</span>
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Domain / Field of Study</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Healthcare AI / Precision Medicine"
                  value={formData.domain}
                  onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Specific Research Topic</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Early Diabetes Detection via Continuous PPG Sensors"
                  value={formData.topic}
                  onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Paper Abstract or Context (Optional)</label>
                <textarea
                  rows={4}
                  placeholder="Paste existing abstract, summary, or literature background to analyze for missing gaps..."
                  value={formData.abstract_text}
                  onChange={(e) => setFormData({ ...formData, abstract_text: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 focus:border-teal-500 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none transition-colors"
                />
              </div>

              {error && (
                <div className="p-3 bg-red-950/60 border border-red-800 text-red-300 rounded-xl text-xs">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 px-4 bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-500 hover:to-emerald-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-teal-600/30 flex items-center justify-center space-x-2 disabled:opacity-50 transition-all"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching Gaps with AI...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Discover Research Gaps</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Results Output */}
          <div className="lg:col-span-7 space-y-6">
            {!result ? (
              <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-2xl p-12 text-center text-slate-400">
                <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                <h3 className="text-base font-semibold text-slate-300">No Research Gap Analysis Yet</h3>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Provide your domain and topic on the left to identify unexplored academic & market opportunities.
                </p>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                
                {/* Maturity Badge & Topic Title */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-xs font-bold text-teal-400 uppercase tracking-wider">{result.domain}</span>
                      <h2 className="text-xl font-bold text-white mt-0.5">{result.topic}</h2>
                    </div>
                    <span className="bg-teal-950 text-teal-300 border border-teal-700/60 px-3 py-1 rounded-full text-xs font-semibold">
                      {analysis?.research_maturity || 'Emerging Domain'}
                    </span>
                  </div>
                </div>

                {/* Identified Research Gaps */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2 mb-3">
                    <Layers className="w-4 h-4" />
                    <span>Primary Unaddressed Research Gaps</span>
                  </h3>
                  <div className="space-y-2.5">
                    {analysis?.primary_gaps?.map((gap, idx) => (
                      <div key={idx} className="flex items-start space-x-3 bg-slate-900/70 p-3 rounded-xl border border-slate-700/50">
                        <span className="text-teal-400 font-bold text-xs mt-0.5">GAP {idx + 1}</span>
                        <span className="text-xs text-slate-200">{gap}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Unexplored Subdomains */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-5 shadow-lg">
                  <h3 className="text-sm font-bold text-emerald-400 flex items-center space-x-2 mb-3">
                    <GitBranch className="w-4 h-4" />
                    <span>Unexplored Subdomains & Niche Frontiers</span>
                  </h3>
                  <ul className="grid sm:grid-cols-3 gap-3">
                    {analysis?.unexplored_subdomains?.map((sub, idx) => (
                      <li key={idx} className="bg-slate-900/80 border border-emerald-900/40 p-3 rounded-xl text-xs text-slate-300 font-medium">
                        {sub}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Suggested Questions & Methodology */}
                <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 space-y-4">
                  <div>
                    <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2 mb-3">
                      <HelpCircle className="w-4 h-4" />
                      <span>Novel Research Questions to Pursue</span>
                    </h3>
                    <ul className="space-y-2">
                      {analysis?.suggested_research_questions?.map((rq, idx) => (
                        <li key={idx} className="flex items-start space-x-2 text-xs text-slate-300 bg-slate-900/50 p-2.5 rounded-lg border border-slate-700/40">
                          <span className="text-teal-400 font-bold">Q{idx + 1}:</span>
                          <span>{rq}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-4 border-t border-slate-700/60">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Recommended Methodology Framework</h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/80 p-3.5 rounded-xl border border-slate-700">
                      {analysis?.recommended_methodology}
                    </p>
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
};

export default ResearchGapFinder;
