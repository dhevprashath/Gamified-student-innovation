import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, CheckCircle2, AlertCircle, Copy, Check, Presentation, Compass, Loader2 } from 'lucide-react';
import ScoreCard from '../components/ScoreCard';
import ProgressBar from '../components/ProgressBar';
import { getProjectReadiness, generatePitch, getPitch } from '../services/api';

const ProjectReadiness = ({ activeProject, onRefreshJourney }) => {
  const [readinessData, setReadinessData] = useState(null);
  const [pitchRecord, setPitchRecord] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadData(activeProject.id);
    }
  }, [activeProject]);

  const loadData = async (projectId) => {
    setLoadingReadiness(true);
    setError(null);
    try {
      const readRes = await getProjectReadiness(projectId);
      setReadinessData(readRes);
      
      try {
        const pitchRes = await getPitch(projectId);
        setPitchRecord(pitchRes);
      } catch (err) {
        setPitchRecord(null);
      }
    } catch (err) {
      setError('Failed to calculate project readiness.');
    } finally {
      setLoadingReadiness(false);
    }
  };

  const handleGeneratePitch = async () => {
    if (!activeProject?.id) return;
    setGeneratingPitch(true);
    setError(null);
    try {
      const res = await generatePitch(activeProject.id);
      setPitchRecord(res);
      if (onRefreshJourney) onRefreshJourney();
      loadData(activeProject.id);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate pitch deck. Please try again.');
    } finally {
      setGeneratingPitch(false);
    }
  };

  const handleCopyScript = () => {
    const scriptText = pitchRecord?.pitch_data?.pitch_script;
    if (scriptText) {
      navigator.clipboard.writeText(scriptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pitchData = pitchRecord?.pitch_data;

  return (
    <div className="space-y-8">
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-purple-900/60 via-slate-800 to-slate-900 border border-purple-500/30 rounded-3xl p-6 shadow-xl">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-semibold mb-2">
          <Rocket className="w-3.5 h-3.5" />
          <span>Module 4 — AI Project Readiness & Pitch Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">Project Readiness & AI Pitch Generator</h1>
        <p className="text-slate-400 text-sm mt-1">
          Calculate your weighted 6-pillar launch readiness score out of 100, review AI recommendations, and generate a pitch deck script.
        </p>
      </div>

      {loadingReadiness ? (
        <div className="bg-slate-800/40 border border-slate-700 rounded-3xl p-12 text-center text-slate-400">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-purple-400 mb-2" />
          <p className="text-xs">Calculating Project Readiness...</p>
        </div>
      ) : !readinessData ? (
        <div className="bg-slate-800/40 border border-dashed border-slate-700 rounded-3xl p-12 text-center text-slate-400">
          <Rocket className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-300">No Readiness Data Found</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Select or create a project on the Dashboard to calculate project readiness.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-fadeIn">
          
          {/* Readiness Dashboard Box */}
          <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div>
                <span className="text-[10px] font-extrabold uppercase text-purple-400 tracking-widest">Weighted Readiness Score</span>
                <h2 className="text-2xl font-bold text-white mt-0.5">{activeProject?.title}</h2>
                <p className="text-xs text-slate-400 mt-1">Formula: Research (20%) + Validation (20%) + Team (10%) + Prototype (25%) + Testing (15%) + Pitch (10%)</p>
              </div>

              {/* Overall Score Circle Indicator */}
              <div className="flex items-center space-x-4 bg-slate-900/90 border border-purple-500/40 rounded-3xl p-5 shadow-2xl shrink-0">
                <div className="relative w-20 h-20 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="40" cy="40" r="34" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                    <circle 
                      cx="40" 
                      cy="40" 
                      r="34" 
                      stroke="currentColor" 
                      strokeWidth="8" 
                      className="text-purple-400 transition-all duration-1000" 
                      strokeDasharray={213.6}
                      strokeDashoffset={213.6 - (213.6 * readinessData.overall_score) / 100}
                      strokeLinecap="round"
                      fill="transparent" 
                    />
                  </svg>
                  <span className="absolute text-xl font-black text-white">{readinessData.overall_score}</span>
                </div>
                <div>
                  <div className="text-xs font-extrabold text-white">Readiness Score</div>
                  <div className="text-xs text-purple-300 font-bold">{readinessData.overall_score} / 100 Points</div>
                  <div className="text-[10px] text-slate-400 mt-0.5">{readinessData.completed_areas?.length || 0} of 6 Areas Complete</div>
                </div>
              </div>

            </div>

            {/* 6 Pillar Scores Progress Bars */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-slate-700/60">
              <ProgressBar label="Research Score (20% Weight)" value={readinessData.research_score} color="teal" />
              <ProgressBar label="Validation Score (20% Weight)" value={readinessData.validation_score} color="indigo" />
              <ProgressBar label="Team Score (10% Weight)" value={readinessData.team_score} color="amber" />
              <ProgressBar label="Prototype Score (25% Weight)" value={readinessData.prototype_score} color="purple" />
              <ProgressBar label="Testing Score (15% Weight)" value={readinessData.testing_score} color="emerald" />
              <ProgressBar label="Pitch Score (10% Weight)" value={readinessData.pitch_score} color="blue" />
            </div>
          </div>

          {/* Completed vs Missing Areas & AI Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Completed & Missing Areas */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-4">
              <h3 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider">
                Area Status Breakdown
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed Areas ({readinessData.completed_areas?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readinessData.completed_areas?.length === 0 ? (
                      <span className="text-xs text-slate-500 italic">No areas completed yet.</span>
                    ) : (
                      readinessData.completed_areas?.map((area) => (
                        <span key={area} className="bg-emerald-950/80 border border-emerald-800 text-emerald-300 text-xs font-bold px-3 py-1 rounded-xl">
                          ✓ {area}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-700/60">
                  <span className="text-xs font-bold text-amber-400 flex items-center space-x-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing Areas ({readinessData.missing_areas?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readinessData.missing_areas?.length === 0 ? (
                      <span className="text-xs text-emerald-400 font-bold">🎉 All 6 Areas Fully Completed!</span>
                    ) : (
                      readinessData.missing_areas?.map((area) => (
                        <span key={area} className="bg-amber-950/80 border border-amber-800 text-amber-300 text-xs font-bold px-3 py-1 rounded-xl">
                          ! {area}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-slate-800/90 border border-slate-700 rounded-3xl p-6 shadow-xl space-y-3">
              <h3 className="text-xs font-extrabold text-purple-300 uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>AI Readiness Recommendations</span>
              </h3>

              <div className="space-y-2">
                {readinessData.recommendations?.length === 0 ? (
                  <p className="text-xs text-emerald-400 font-bold">Your project is fully launch-ready across all readiness pillars!</p>
                ) : (
                  readinessData.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2.5 bg-slate-900/80 p-3 rounded-xl border border-slate-700/60 text-xs text-slate-200">
                      <span className="w-4 h-4 rounded-full bg-purple-900 text-purple-300 text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <span>{rec}</span>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>

          {/* AI PITCH GENERATOR SECTION */}
          <div className="bg-slate-800/90 border border-purple-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-bold mb-1">
                  <Presentation className="w-3.5 h-3.5" />
                  <span>AI Pitch Deck Generator</span>
                </div>
                <h2 className="text-xl font-bold text-white">Generate Startup Pitch & 2-Minute Script</h2>
                <p className="text-xs text-slate-400 mt-1">Automatically generate 10 pitch deck cards and a polished 2-minute elevator pitch script.</p>
              </div>

              <button
                onClick={handleGeneratePitch}
                disabled={generatingPitch}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-bold rounded-2xl text-xs sm:text-sm shadow-lg shadow-purple-600/30 flex items-center space-x-2 disabled:opacity-50 transition-all shrink-0"
              >
                {generatingPitch ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Generating Pitch with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Pitch</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-950/80 border border-red-800 text-red-300 rounded-xl text-xs font-medium">
                {error}
              </div>
            )}

            {/* Generated Pitch Display */}
            {pitchData && (
              <div className="space-y-6 animate-fadeIn pt-4 border-t border-slate-700/60">
                
                {/* 2-Minute Pitch Script Box */}
                <div className="bg-gradient-to-r from-purple-950/80 to-slate-900 border border-purple-500/50 rounded-2xl p-6 shadow-xl relative">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-purple-300 flex items-center space-x-2">
                      <Presentation className="w-4 h-4" />
                      <span>2-Minute Elevator Pitch Script</span>
                    </h3>

                    <button
                      onClick={handleCopyScript}
                      className="flex items-center space-x-1.5 px-3 py-1.5 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Pitch!' : 'Copy Pitch'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-slate-100 leading-relaxed italic bg-slate-950/80 p-4 rounded-xl border border-slate-800">
                    "{pitchData.pitch_script}"
                  </p>
                </div>

                {/* 9 Pitch Section Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  
                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">1. Project Introduction</h4>
                    <p className="text-xs text-slate-300">{pitchData.project_introduction}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">2. Problem</h4>
                    <p className="text-xs text-slate-300">{pitchData.problem}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">3. Solution</h4>
                    <p className="text-xs text-slate-300">{pitchData.solution}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">4. Innovation</h4>
                    <p className="text-xs text-slate-300">{pitchData.innovation}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">5. Target Users</h4>
                    <p className="text-xs text-slate-300">{pitchData.target_users}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">6. Market Opportunity</h4>
                    <p className="text-xs text-slate-300">{pitchData.market_opportunity}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">7. Business Model</h4>
                    <p className="text-xs text-slate-300">{pitchData.business_model}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">8. Social / Environmental Impact</h4>
                    <p className="text-xs text-slate-300">{pitchData.social_environmental_impact}</p>
                  </div>

                  <div className="bg-slate-900/80 border border-slate-700 p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-purple-300 uppercase tracking-wider mb-1">9. Future Scope</h4>
                    <p className="text-xs text-slate-300">{pitchData.future_scope}</p>
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

export default ProjectReadiness;
