import React, { useState, useEffect } from 'react';
import { Rocket, Sparkles, CheckCircle2, AlertCircle, Copy, Check, Presentation, Compass, Loader2 } from 'lucide-react';
import ProgressBar from '../components/ProgressBar';
import CircularProgress from '../components/CircularProgress';
import { ReadinessSkeleton } from '../components/SkeletonLoader';
import { getProjectReadiness, generatePitch, getPitch } from '../services/api';
import { useToast } from '../context/ToastContext';

const PITCH_STEPS = [
  'Generating elevator pitch...',
  'Formatting pitch deck slides...',
  'Finalizing presentation deck...'
];

const ProjectReadiness = ({ activeProject, onRefreshJourney }) => {
  const { addToast } = useToast();
  const [readinessData, setReadinessData] = useState(null);
  const [pitchRecord, setPitchRecord] = useState(null);
  const [loadingReadiness, setLoadingReadiness] = useState(false);
  const [generatingPitch, setGeneratingPitch] = useState(false);
  const [pitchStepIndex, setPitchStepIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (activeProject?.id) {
      loadData(activeProject.id);
    }
  }, [activeProject]);

  useEffect(() => {
    let interval;
    if (generatingPitch) {
      setPitchStepIndex(0);
      interval = setInterval(() => {
        setPitchStepIndex((prev) => (prev < PITCH_STEPS.length - 1 ? prev + 1 : prev));
      }, 1200);
    }
    return () => clearInterval(interval);
  }, [generatingPitch]);

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

      addToast({
        title: 'Pitch Deck Generated',
        description: 'Created 2-minute elevator pitch script and 9 deck cards.',
        type: 'achievement',
        xpBonus: 80
      });
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
      addToast({
        title: 'Copied to Clipboard',
        description: '2-Minute Elevator Pitch script copied to your clipboard.',
        type: 'info'
      });
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const pitchData = pitchRecord?.pitch_data;

  return (
    <div className="space-y-8 animate-page-enter">
      
      {/* Header Banner */}
      <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold mb-2">
          <Rocket className="w-3.5 h-3.5" />
          <span>Module 4 — AI Project Readiness & Pitch Generator</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-[#171717]">Project Readiness & AI Pitch Generator</h1>
        <p className="text-[#6B6B65] text-sm mt-1">
          Calculate your weighted 6-pillar launch readiness score out of 100, review AI recommendations, and generate a pitch deck script.
        </p>
      </div>

      {loadingReadiness ? (
        <ReadinessSkeleton />
      ) : !readinessData ? (
        <div className="bg-white border border-dashed border-[#E5E3DD] rounded-3xl p-12 text-center text-[#6B6B65]">
          <Rocket className="w-12 h-12 text-[#6B6B65] mx-auto mb-3" />
          <h3 className="text-base font-bold text-[#171717]">No Readiness Data Found</h3>
          <p className="text-xs text-[#6B6B65] mt-1 max-w-sm mx-auto">
            Select or create a project on the Dashboard to calculate project readiness.
          </p>
        </div>
      ) : (
        <div className="space-y-8 animate-page-enter">
          
          {/* Readiness Dashboard Box */}
          <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
              
              <div>
                <span className="text-[10px] font-extrabold uppercase text-[#E58A4E] tracking-widest">Weighted Readiness Score</span>
                <h2 className="text-2xl font-black text-[#171717] mt-0.5">{activeProject?.title}</h2>
                <p className="text-xs text-[#6B6B65] mt-1">Formula: Research (20%) + Validation (20%) + Team (10%) + Prototype (25%) + Testing (15%) + Pitch (10%)</p>
              </div>

              {/* Overall Score Circle Indicator */}
              <div className="flex items-center space-x-4 bg-[#F7F6F2] border border-[#E5E3DD] rounded-3xl p-5 shadow-xs shrink-0">
                <CircularProgress
                  score={readinessData.overall_score}
                  maxScore={100}
                  size={84}
                  strokeWidth={8}
                  label="Readiness Score"
                  sublabel={`${readinessData.completed_areas?.length || 0} of 6 Pillars Complete`}
                  color="orange"
                />
              </div>

            </div>

            {/* 6 Pillar Scores Progress Bars */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-6 border-t border-[#E5E3DD]">
              <ProgressBar label="Research Score (20% Weight)" value={readinessData.research_score} color="orange" />
              <ProgressBar label="Validation Score (20% Weight)" value={readinessData.validation_score} color="orange" />
              <ProgressBar label="Team Score (10% Weight)" value={readinessData.team_score} color="orange" />
              <ProgressBar label="Prototype Score (25% Weight)" value={readinessData.prototype_score} color="orange" />
              <ProgressBar label="Testing Score (15% Weight)" value={readinessData.testing_score} color="orange" />
              <ProgressBar label="Pitch Score (10% Weight)" value={readinessData.pitch_score} color="orange" />
            </div>
          </div>

          {/* Completed vs Missing Areas & AI Recommendations */}
          <div className="grid md:grid-cols-2 gap-6">
            
            {/* Completed & Missing Areas */}
            <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-4">
              <h3 className="text-xs font-extrabold text-[#171717] uppercase tracking-wider">
                Area Status Breakdown
              </h3>

              <div className="space-y-3">
                <div>
                  <span className="text-xs font-bold text-[#E58A4E] flex items-center space-x-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Completed Areas ({readinessData.completed_areas?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readinessData.completed_areas?.length === 0 ? (
                      <span className="text-xs text-[#6B6B65] italic">No areas completed yet.</span>
                    ) : (
                      readinessData.completed_areas?.map((area) => (
                        <span key={area} className="bg-[#F8E8DB] border border-[#E58A4E]/30 text-[#E58A4E] text-xs font-bold px-3 py-1 rounded-xl">
                          ✓ {area}
                        </span>
                      ))
                    )}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#E5E3DD]">
                  <span className="text-xs font-bold text-[#E58A4E] flex items-center space-x-1.5 mb-2">
                    <AlertCircle className="w-4 h-4" />
                    <span>Missing Areas ({readinessData.missing_areas?.length || 0})</span>
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {readinessData.missing_areas?.length === 0 ? (
                      <span className="text-xs text-[#E58A4E] font-bold">🎉 All 6 Areas Fully Completed!</span>
                    ) : (
                      readinessData.missing_areas?.map((area) => (
                        <span key={area} className="bg-[#F8E8DB] border border-[#E58A4E]/30 text-[#E58A4E] text-xs font-bold px-3 py-1 rounded-xl">
                          ! {area}
                        </span>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* AI Recommendations */}
            <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 shadow-xs space-y-3">
              <h3 className="text-xs font-extrabold text-[#E58A4E] uppercase tracking-wider flex items-center space-x-2">
                <Compass className="w-4 h-4" />
                <span>AI Readiness Recommendations</span>
              </h3>

              <div className="space-y-2">
                {readinessData.recommendations?.length === 0 ? (
                  <p className="text-xs text-[#E58A4E] font-bold">Your project is fully launch-ready across all readiness pillars!</p>
                ) : (
                  readinessData.recommendations?.map((rec, i) => (
                    <div key={i} className="flex items-start space-x-2.5 bg-[#F7F6F2] p-3 rounded-xl border border-[#E5E3DD] text-xs text-[#171717]">
                      <span className="w-4 h-4 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
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
          <div className="bg-white border border-[#E5E3DD] rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-[#F8E8DB] text-[#E58A4E] text-xs font-bold mb-1">
                  <Presentation className="w-3.5 h-3.5" />
                  <span>AI Pitch Deck Generator</span>
                </div>
                <h2 className="text-xl font-bold text-[#171717]">Generate Startup Pitch & 2-Minute Script</h2>
                <p className="text-xs text-[#6B6B65] mt-1">Automatically generate 9 pitch deck cards and a polished 2-minute elevator pitch script.</p>
              </div>

              <button
                onClick={handleGeneratePitch}
                disabled={generatingPitch}
                className="px-5 py-3 bg-[#E58A4E] hover:bg-[#D4793D] text-white font-bold rounded-2xl text-xs sm:text-sm btn-primary-effect shadow-xs flex items-center space-x-2 disabled:opacity-50 transition-all shrink-0"
              >
                {generatingPitch ? (
                  <div className="flex items-center space-x-2">
                    <Loader2 className="w-4 h-4 animate-spin text-white" />
                    <span className="animate-fade-in key={pitchStepIndex}">{PITCH_STEPS[pitchStepIndex]}</span>
                  </div>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Generate Pitch</span>
                  </>
                )}
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium animate-fade-in">
                {error}
              </div>
            )}

            {/* Generated Pitch Display */}
            {pitchData && (
              <div className="space-y-6 animate-page-enter pt-4 border-t border-[#E5E3DD]">
                
                {/* 2-Minute Pitch Script Box */}
                <div className="bg-[#F8E8DB]/50 border border-[#E58A4E]/30 rounded-2xl p-6 shadow-xs relative">
                  <div className="flex justify-between items-center mb-3">
                    <h3 className="text-sm font-bold text-[#E58A4E] flex items-center space-x-2">
                      <Presentation className="w-4 h-4" />
                      <span>2-Minute Elevator Pitch Script</span>
                    </h3>

                    <button
                      onClick={handleCopyScript}
                      className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-[#E58A4E] hover:bg-[#D4793D] text-white rounded-xl text-xs font-bold shadow-xs btn-primary-effect transition-all"
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-white" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied Pitch!' : 'Copy Script'}</span>
                    </button>
                  </div>

                  <p className="text-xs text-[#171717] leading-relaxed italic bg-white p-4 rounded-xl border border-[#E5E3DD]">
                    "{pitchData.pitch_script}"
                  </p>
                </div>

                {/* 9 Pitch Section Cards */}
                <div className="grid md:grid-cols-3 gap-4">
                  
                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">1. Project Introduction</h4>
                    <p className="text-xs text-[#171717]">{pitchData.project_introduction}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">2. Problem</h4>
                    <p className="text-xs text-[#171717]">{pitchData.problem}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">3. Solution</h4>
                    <p className="text-xs text-[#171717]">{pitchData.solution}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">4. Innovation</h4>
                    <p className="text-xs text-[#171717]">{pitchData.innovation}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">5. Target Users</h4>
                    <p className="text-xs text-[#171717]">{pitchData.target_users}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">6. Market Opportunity</h4>
                    <p className="text-xs text-[#171717]">{pitchData.market_opportunity}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">7. Business Model</h4>
                    <p className="text-xs text-[#171717]">{pitchData.business_model}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">8. Social / Environmental Impact</h4>
                    <p className="text-xs text-[#171717]">{pitchData.social_environmental_impact}</p>
                  </div>

                  <div className="bg-[#F7F6F2] border border-[#E5E3DD] p-4 rounded-2xl">
                    <h4 className="text-xs font-bold text-[#E58A4E] uppercase tracking-wider mb-1">9. Future Scope</h4>
                    <p className="text-xs text-[#171717]">{pitchData.future_scope}</p>
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
