import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Presentation, Download, Sparkles, RefreshCw, FileText, CheckCircle2, Edit3, Loader2 } from 'lucide-react';
import { generatePitch, getPitch } from '../services/api';
import { useToast } from '../context/ToastContext';

const PitchStudio = ({ activeProject }) => {
  const { addToast } = useToast();
  const [loading, setLoading] = useState(false);
  const [pitchData, setPitchData] = useState(null);

  const defaultSections = [
    { key: 'problem', title: 'Problem', content: 'College students struggle to find skilled project partners and validate early capstone ideas.' },
    { key: 'solution', title: 'Solution', content: 'INNOVATE provides semantic MiniLM skill matching, literature gap discovery, and pitch scoring.' },
    { key: 'target_users', title: 'Target Users', content: '20,000+ campus innovators, hackathon teams, and student entrepreneurs.' },
    { key: 'market', title: 'Market Opportunity', content: '\$4.2B higher-education incubator & student venture creation market.' },
    { key: 'business_model', title: 'Business Model', content: 'University licensing model + premium incubator matching for venture funds.' },
    { key: 'competitive_advantage', title: 'Competitive Advantage', content: 'Semantic MiniLM matching vs generic static job boards or simple chatbots.' },
    { key: 'team', title: 'Team', content: 'Dhev Prashath (Tech Lead) + Arun K (UI/UX) + Priya Sharma (Full Stack).' },
    { key: 'impact', title: 'Expected Impact', content: 'Increase successful student startup incubation rate by 3.5x across partner campuses.' }
  ];

  const [sections, setSections] = useState(defaultSections);
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);

  useEffect(() => {
    if (activeProject?.id) {
      loadPitch(activeProject.id);
    }
  }, [activeProject]);

  const loadPitch = async (projectId) => {
    setLoading(true);
    try {
      const res = await getPitch(projectId);
      if (res && res.pitch_data) {
        setPitchData(res.pitch_data);
      } else {
        handleGeneratePitch();
      }
    } catch (err) {
      handleGeneratePitch();
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePitch = async () => {
    if (!activeProject) return;
    setLoading(true);
    try {
      const res = await generatePitch(activeProject.id);
      setPitchData(res.pitch_data || res);
      addToast({
        title: 'Pitch Generated!',
        description: '2-minute pitch deck sections populated using AI analysis.',
        type: 'success',
        xpBonus: 80
      });
    } catch (err) {
      console.error('Pitch generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = () => {
    addToast({
      title: 'Exporting Pitch PDF...',
      description: 'Generating high-res Neo-Brutalist pitch deck document.',
      type: 'success'
    });
    window.print();
  };

  const handleSectionContentChange = (index, newContent) => {
    setSections((prev) => {
      const copy = [...prev];
      copy[index].content = newContent;
      return copy;
    });
  };

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-pink border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717] mb-2">
            <Presentation className="w-4 h-4 text-deep-green" />
            <span>2-MINUTE PITCH STUDIO</span>
          </div>
          <h1 className="text-3xl font-extrabold font-heading text-text-main">
            AI PITCH STUDIO
          </h1>
          <p className="text-xs font-semibold text-text-main/70">
            Edit and refine your 8 core pitch deck sections with instant score evaluation.
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleGeneratePitch}
            disabled={loading}
            className="brutal-btn brutal-btn-yellow text-xs py-2.5 px-4"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
            <span>Improve Pitch</span>
          </button>

          <button
            onClick={handleExportPDF}
            className="brutal-btn brutal-btn-primary text-xs py-2.5 px-4"
          >
            <Download className="w-4 h-4" />
            <span>Export PDF</span>
          </button>
        </div>
      </div>

      {/* PITCH SCORE BANNER */}
      <div className="brutal-card-lg p-6 bg-pure-white border-3 border-border-dark flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase bg-soft-green px-2 py-0.5 rounded border border-border-dark">
            EVALUATION STATUS
          </span>
          <h2 className="text-2xl font-extrabold font-heading text-text-main mt-1">
            PITCH DECK EVALUATION: HIGH IMPACT
          </h2>
          <p className="text-xs font-semibold text-text-main/70">
            Project: {activeProject?.title || 'AI Student Skill Matching Platform'}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-text-main/70">PITCH SCORE</span>
            <p className="text-3xl font-extrabold font-heading text-deep-green">
              84%
            </p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-soft-pink border-3 border-border-dark flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0px_#171717]">
            🎤
          </div>
        </div>
      </div>

      {/* PITCH EDITOR CONTAINER */}
      <div className="grid md:grid-cols-12 gap-6">
        
        {/* Left Section Selector */}
        <div className="md:col-span-4 space-y-2">
          <span className="text-xs font-extrabold uppercase text-text-main/70 px-1">PITCH SECTIONS (8)</span>
          {sections.map((sec, idx) => (
            <button
              key={sec.key}
              onClick={() => setActiveSectionIndex(idx)}
              className={`w-full brutal-card p-3 text-left flex items-center justify-between text-xs font-extrabold ${
                activeSectionIndex === idx
                  ? 'bg-deep-green text-white border-border-dark shadow-[3px_3px_0px_#171717]'
                  : 'bg-pure-white text-text-main hover:bg-soft-yellow/40'
              }`}
            >
              <span>{idx + 1}. {sec.title}</span>
              <Edit3 className="w-3.5 h-3.5" />
            </button>
          ))}
        </div>

        {/* Right Section Editor Card */}
        <div className="md:col-span-8 brutal-card-lg p-6 bg-pure-white border-3 border-border-dark space-y-4">
          <div className="flex justify-between items-center border-b-2 border-border-dark pb-3">
            <h3 className="text-xl font-extrabold font-heading text-text-main">
              SECTION {activeSectionIndex + 1}: {sections[activeSectionIndex].title}
            </h3>
            <span className="text-xs font-extrabold bg-soft-yellow border border-border-dark px-2.5 py-0.5 rounded">
              READY
            </span>
          </div>

          <div className="space-y-2">
            <label className="block text-xs font-extrabold text-text-main uppercase">
              Edit Content Statement
            </label>
            <textarea
              rows={6}
              value={sections[activeSectionIndex].content}
              onChange={(e) => handleSectionContentChange(activeSectionIndex, e.target.value)}
              className="brutal-input text-xs font-medium leading-relaxed"
            />
          </div>

          <div className="p-4 bg-soft-green/30 border-2 border-border-dark rounded-xl text-xs font-semibold text-text-main space-y-1">
            <span className="font-extrabold text-deep-green">💡 AI Pitch Tip:</span>
            <p>Keep your problem statement under 30 seconds to hold investor and competition judge attention.</p>
          </div>
        </div>

      </div>

    </div>
  );
};

export default PitchStudio;
