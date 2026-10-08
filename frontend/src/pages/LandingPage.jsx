import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles, Rocket, CheckCircle2 } from 'lucide-react';
import { 
  StudentHeroIllustration, 
  IdeaIconIllustration, 
  ResearchIconIllustration, 
  TeamIconIllustration, 
  BuildIconIllustration, 
  PitchIconIllustration, 
  RocketLaunchIllustration 
} from '../components/Illustrations';

const LandingPage = ({ setActiveTab, onOpenCreateModal }) => {
  const journeyStages = [
    { id: 'idea', title: '💡 IDEA', desc: 'Define your problem statement & shape the vision.', color: 'bg-soft-yellow' },
    { id: 'research', title: '🔬 RESEARCH', desc: 'Analyze literature gaps & existing work.', color: 'bg-soft-blue' },
    { id: 'team', title: '👥 TEAM', desc: 'Match with student co-founders & devs.', color: 'bg-soft-green' },
    { id: 'build', title: '🛠 BUILD', desc: 'Manage sprint tasks, files & prototypes.', color: 'bg-soft-lavender' },
    { id: 'pitch', title: '🎤 PITCH', desc: 'Generate 2-min pitch decks & readiness score.', color: 'bg-soft-pink' },
    { id: 'launch', title: '🚀 LAUNCH', desc: 'Connect to funding, grants & incubators.', color: 'bg-soft-orange' }
  ];

  return (
    <div className="space-y-16 py-4 pb-20">

      {/* ── HERO SECTION ── */}
      <section className="brutal-card-lg p-8 lg:p-12 bg-pure-white relative overflow-hidden">
        {/* Floating Background Badges */}
        <div className="absolute top-4 right-4 bg-soft-yellow border-2 border-border-dark px-3 py-1 rounded-lg text-xs font-extrabold rotate-3 shadow-[2px_2px_0px_#171717]">
          🎓 College Incubator
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-center relative z-10">
          
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-soft-pink border-2 border-border-dark text-xs font-extrabold text-text-main shadow-[3px_3px_0px_#171717]">
              <Sparkles className="w-4 h-4 text-deep-green" />
              <span>STUDENT INNOVATION PLATFORM</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold font-heading text-text-main tracking-tight leading-[1.08]">
              TURN YOUR IDEA <br />
              <span className="bg-soft-yellow px-2 py-0.5 border-3 border-border-dark inline-block rotate-[-1deg] shadow-[4px_4px_0px_#171717] text-deep-green">
                INTO SOMETHING REAL.
              </span>
            </h1>

            <p className="text-lg font-medium text-text-main/80 max-w-xl leading-relaxed">
              From your first idea to a working project, pitch and potential startup — build it here.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={() => {
                  onOpenCreateModal();
                }}
                className="brutal-btn brutal-btn-primary text-base py-3.5 px-6 shadow-[5px_5px_0px_#171717]"
              >
                <span>Start Your Idea</span>
                <ArrowRight className="w-5 h-5" />
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="brutal-btn brutal-btn-yellow text-base py-3.5 px-6"
              >
                <span>Explore Projects</span>
              </button>
            </div>

            {/* Quick trust badges */}
            <div className="pt-4 flex items-center gap-6 text-xs font-bold text-text-main/70">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-deep-green" /> 100% Free for Students
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-deep-green" /> MiniLM Semantic Matching
              </span>
            </div>
          </div>

          <div className="lg:col-span-5 flex justify-center">
            <motion.div
              initial={{ scale: 0.95, rotate: -2 }}
              animate={{ scale: 1, rotate: 1 }}
              transition={{ duration: 0.5, ease: "easeOut" }}
              className="w-full"
            >
              <StudentHeroIllustration className="w-full max-w-md mx-auto" />
            </motion.div>
          </div>

        </div>
      </section>

      {/* ── EXPRESSIVE VISUAL JOURNEY SECTION ── */}
      <section className="space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-block bg-soft-lavender border-2 border-border-dark px-3 py-1 rounded-lg text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
            THE INNOVATION PIPELINE
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-text-main">
            FROM LIGHTBULB TO LAUNCH 🚀
          </h2>
          <p className="text-sm font-medium text-text-main/70">
            A structured, gamified journey designed specifically for student founders and builders.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {journeyStages.map((stage, idx) => (
            <div
              key={stage.id}
              onClick={() => setActiveTab('journey')}
              className={`brutal-card p-6 ${stage.color} brutal-card-hover cursor-pointer space-y-4`}
            >
              <div className="flex justify-between items-start">
                <span className="text-xs font-extrabold px-2.5 py-1 bg-pure-white border-2 border-border-dark rounded-md shadow-[2px_2px_0px_#171717]">
                  STAGE 0{idx + 1}
                </span>
                <span className="text-xl">➔</span>
              </div>

              <h3 className="text-xl font-extrabold font-heading text-text-main">
                {stage.title}
              </h3>

              <p className="text-xs font-semibold text-text-main/80 leading-relaxed">
                {stage.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── WHY INNOVATE SECTION ── */}
      <section className="brutal-card p-8 bg-soft-green border-3 border-border-dark space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h3 className="text-2xl font-extrabold font-heading text-text-main">
              NOT JUST ANOTHER COLLEGE DASHBOARD.
            </h3>
            <p className="text-sm font-medium text-text-main/80 mt-1 max-w-xl">
              INNOVATE gives you semantic research tools, co-founder matching, pitch scoring, and direct incubator alignment.
            </p>
          </div>

          <button
            onClick={() => setActiveTab('ideas')}
            className="brutal-btn brutal-btn-primary shrink-0 text-sm py-3 px-6"
          >
            <span>Shape Your First Idea</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>

    </div>
  );
};

export default LandingPage;
