import React, { useState, useEffect } from 'react';
import { Search, BookOpen, Layers, HelpCircle, GitBranch, History, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { analyzeGaps, getResearchHistory } from '../services/api';

const ResearchGapFinder = ({ onQuestComplete }) => {
  const [formData, setFormData] = useState({ domain: '', topic: '', abstract_text: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError]   = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => { loadHistory(); }, []);

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
    setLoading(true); setError(null);
    try {
      const res = await analyzeGaps(formData);
      setResult(res); loadHistory();
      if (onQuestComplete) onQuestComplete('val_1', 100);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to analyze research gaps. Please try again.');
    } finally { setLoading(false); }
  };

  const analysis = result?.analysis_result;

  return (
    <div className="space-y-8">

      {/* Header Banner */}
      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
        className="bg-surface border border-border rounded-3xl p-6 shadow-xs"
      >
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-primary-soft text-primary text-xs font-bold mb-2 border border-primary/20">
              <Search className="w-3.5 h-3.5" />
              <span>Module 2 — AI Research Gap Finder</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-text">Literature & Research Gap Finder</h1>
            <p className="text-muted text-sm mt-1">
              Identify unaddressed research problems, novel subdomains, and concrete questions to ground your innovation.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.04, y: -1 }} whileTap={{ scale: 0.96 }}
            onClick={() => setShowHistory(!showHistory)}
            className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-bg border border-border hover:border-primary/40 text-text text-xs font-bold self-start md:self-auto transition-colors cursor-pointer"
          >
            <History className="w-4 h-4 text-primary" />
            <span>{showHistory ? 'Back to Form' : `History (${history.length})`}</span>
          </motion.button>
        </div>
      </motion.div>

      <AnimatePresence mode="wait">
        {showHistory ? (
          /* History View */
          <motion.div
            key="history"
            initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="bg-surface border border-border rounded-3xl p-6 shadow-xs"
          >
            <h2 className="text-lg font-bold text-text mb-4">Past Research Analyses</h2>
            {history.length === 0 ? (
              <p className="text-muted text-sm">No previous gap searches found.</p>
            ) : (
              <div className="grid gap-4 md:grid-cols-2">
                {history.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -3 }} whileTap={{ scale: 0.98 }}
                    onClick={() => { setResult(item); setShowHistory(false); }}
                    className="bg-bg border border-border hover:border-primary/40 rounded-2xl p-4 cursor-pointer card-hover-effect"
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-primary text-sm">{item.topic}</h3>
                      <span className="text-[10px] bg-primary-soft text-primary px-2 py-0.5 rounded border border-primary/20">
                        {item.domain}
                      </span>
                    </div>
                    <p className="text-xs text-muted mt-2 line-clamp-2">{item.abstract_text || 'No abstract text'}</p>
                    <div className="text-[10px] text-muted mt-3">
                      {new Date(item.created_at).toLocaleDateString()}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          /* Main Form & Results */
          <motion.div
            key="form"
            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="grid lg:grid-cols-12 gap-8"
          >

            {/* Input Form */}
            <div className="lg:col-span-5 bg-surface border border-border rounded-3xl p-6 shadow-xs h-fit">
              <h2 className="text-base font-bold text-text mb-4 flex items-center space-x-2">
                <BookOpen className="w-5 h-5 text-primary" />
                <span>Define Research Topic</span>
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-text mb-1">Domain / Field of Study</label>
                  <input
                    type="text" required
                    placeholder="e.g. Healthcare AI / Precision Medicine"
                    value={formData.domain}
                    onChange={(e) => setFormData({ ...formData, domain: e.target.value })}
                    className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">Specific Research Topic</label>
                  <input
                    type="text" required
                    placeholder="e.g. Early Diabetes Detection via Continuous PPG Sensors"
                    value={formData.topic}
                    onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
                    className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted focus:outline-hidden transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text mb-1">Paper Abstract or Context (Optional)</label>
                  <textarea
                    rows={4}
                    placeholder="Paste existing abstract, summary, or literature background to analyze for missing gaps..."
                    value={formData.abstract_text}
                    onChange={(e) => setFormData({ ...formData, abstract_text: e.target.value })}
                    className="w-full bg-bg border border-border focus:border-primary rounded-xl px-3.5 py-2.5 text-sm text-text placeholder-muted focus:outline-hidden transition-colors resize-none"
                  />
                </div>

                {error && (
                  <div className="p-3 bg-danger/10 border border-danger/30 text-danger rounded-xl text-xs">
                    {error}
                  </div>
                )}

                <motion.button
                  type="submit" disabled={loading}
                  whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                  whileTap={!loading ? { scale: 0.97 } : {}}
                  className="w-full py-3 px-4 bg-primary hover:opacity-90 text-on-primary font-bold rounded-xl text-sm shadow-warm flex items-center justify-center space-x-2 disabled:opacity-50 transition-all btn-primary-effect cursor-pointer"
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
                </motion.button>
              </form>
            </div>

            {/* Results Output */}
            <div className="lg:col-span-7 space-y-6">
              {!result ? (
                <div className="bg-surface border border-dashed border-border rounded-3xl p-12 text-center">
                  <Search className="w-12 h-12 text-muted mx-auto mb-3" />
                  <h3 className="text-base font-bold text-text">No Research Gap Analysis Yet</h3>
                  <p className="text-xs text-muted mt-1 max-w-sm mx-auto">
                    Provide your domain and topic on the left to identify unexplored academic & market opportunities.
                  </p>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                  className="space-y-6"
                >
                  {/* Maturity Badge & Topic Title */}
                  <div className="bg-surface border border-border rounded-2xl p-6 shadow-xs">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-bold text-primary uppercase tracking-wider">{result.domain}</span>
                        <h2 className="text-xl font-bold text-text mt-0.5">{result.topic}</h2>
                      </div>
                      <span className="bg-primary-soft text-primary border border-primary/20 px-3 py-1 rounded-full text-xs font-semibold">
                        {analysis?.research_maturity || 'Emerging Domain'}
                      </span>
                    </div>
                  </div>

                  {/* Identified Research Gaps */}
                  <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-primary flex items-center space-x-2 mb-3">
                      <Layers className="w-4 h-4" />
                      <span>Primary Unaddressed Research Gaps</span>
                    </h3>
                    <div className="space-y-2.5">
                      {analysis?.primary_gaps?.map((gap, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.05 }}
                          className="flex items-start space-x-3 bg-bg p-3 rounded-xl border border-border"
                        >
                          <span className="text-primary font-black text-xs mt-0.5 shrink-0">GAP {idx + 1}</span>
                          <span className="text-xs text-text">{gap}</span>
                        </motion.div>
                      ))}
                    </div>
                  </div>

                  {/* Unexplored Subdomains */}
                  <div className="bg-surface border border-border rounded-2xl p-5 shadow-xs">
                    <h3 className="text-sm font-bold text-success flex items-center space-x-2 mb-3">
                      <GitBranch className="w-4 h-4" />
                      <span>Unexplored Subdomains & Niche Frontiers</span>
                    </h3>
                    <ul className="grid sm:grid-cols-3 gap-3">
                      {analysis?.unexplored_subdomains?.map((sub, idx) => (
                        <li key={idx} className="bg-bg border border-border p-3 rounded-xl text-xs text-text font-medium">
                          {sub}
                        </li>
                      ))}
                    </ul>
                  </div>

                  {/* Suggested Questions & Methodology */}
                  <div className="bg-surface border border-border rounded-2xl p-6 space-y-4 shadow-xs">
                    <div>
                      <h3 className="text-sm font-bold text-text flex items-center space-x-2 mb-3">
                        <HelpCircle className="w-4 h-4 text-primary" />
                        <span>Novel Research Questions to Pursue</span>
                      </h3>
                      <ul className="space-y-2">
                        {analysis?.suggested_research_questions?.map((rq, idx) => (
                          <li key={idx} className="flex items-start space-x-2 text-xs text-text bg-bg p-2.5 rounded-lg border border-border">
                            <span className="text-primary font-black shrink-0">Q{idx + 1}:</span>
                            <span>{rq}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 border-t border-border">
                      <h3 className="text-xs font-bold text-muted uppercase tracking-wider mb-1">Recommended Methodology Framework</h3>
                      <p className="text-xs text-text leading-relaxed bg-bg p-3.5 rounded-xl border border-border">
                        {analysis?.recommended_methodology}
                      </p>
                    </div>
                  </div>

                </motion.div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default ResearchGapFinder;
