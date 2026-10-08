import React from 'react';
import { motion } from 'framer-motion';
import { Coins, ExternalLink, Sparkles, ArrowRight, Clock, Award } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const FundingIncubation = ({ activeProject }) => {
  const { addToast } = useToast();

  const opportunities = [
    {
      id: 'opp-1',
      name: 'Student Startup Incubator',
      category: 'EdTech & AI',
      eligibility: 'College Students & Recent Grads',
      matchPct: 91,
      deadline: '24 days left',
      type: '\$25,000 Equity-free Grant + Workspace',
      description: '12-week intensive accelerator offering seed funding, cloud credits, and mentor access.',
      color: 'bg-soft-yellow'
    },
    {
      id: 'opp-2',
      name: 'National Campus Innovation Fund',
      category: 'DeepTech / Software',
      eligibility: 'Undergraduate & Masters Innovators',
      matchPct: 87,
      deadline: '12 days left',
      type: '\$15,000 Non-Dilutive Grant',
      description: 'Government innovation grant supporting student capstone commercialization.',
      color: 'bg-soft-green'
    },
    {
      id: 'opp-3',
      name: 'Global AI Student Challenge 2026',
      category: 'Artificial Intelligence',
      eligibility: 'Open to all registered university teams',
      matchPct: 83,
      deadline: '35 days left',
      type: '\$50,000 Prize Pool + VC Pitch',
      description: 'Global competition for projects utilizing LLM embeddings, semantic search, or agents.',
      color: 'bg-soft-blue'
    },
    {
      id: 'opp-4',
      name: 'University Micro-Venture Grant',
      category: 'General Student Tech',
      eligibility: 'At least 1 enrolled student co-founder',
      matchPct: 79,
      deadline: '8 days left',
      type: '\$5,000 Prototyping Stipend',
      description: 'Fast-track funding for initial MVP validation and target user testing.',
      color: 'bg-soft-pink'
    }
  ];

  const handleApply = (opp) => {
    addToast({
      title: `Applying for ${opp.name}`,
      description: `Preparing your pitch deck & readiness report for application submission...`,
      type: 'success',
      xpBonus: 60
    });
  };

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-orange border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <Coins className="w-4 h-4 text-deep-green" />
          <span>INCUBATION & GRANT DISCOVERY</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-text-main">
          FUNDING & INCUBATION
        </h1>
        <p className="text-xs font-semibold text-text-main/70">
          Discover grants, accelerators, and pitch competitions matched to your project domain and readiness score.
        </p>
      </div>

      {/* OPPORTUNITIES GRID */}
      <div className="space-y-6">
        <div className="flex justify-between items-center text-xs font-extrabold text-text-main uppercase tracking-wider px-1">
          <span>MATCHED OPPORTUNITIES ({opportunities.length})</span>
          <span>RECOMMENDED BY DOMAIN</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className={`brutal-card p-6 ${opp.color} border-3 border-border-dark space-y-4 brutal-card-hover flex flex-col justify-between`}
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase bg-pure-white border border-border-dark px-2 py-0.5 rounded">
                      {opp.category}
                    </span>
                    <h3 className="text-xl font-extrabold font-heading text-text-main mt-1">
                      {opp.name}
                    </h3>
                  </div>

                  <div className="text-right bg-pure-white border-2 border-border-dark px-2.5 py-1 rounded-xl shadow-[2px_2px_0px_#171717]">
                    <span className="text-[10px] font-extrabold uppercase block text-text-main/70">MATCH</span>
                    <span className="text-lg font-extrabold font-heading text-deep-green">
                      {opp.matchPct}%
                    </span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-text-main/80">
                  {opp.description}
                </p>

                <div className="p-3 bg-pure-white rounded-xl border-2 border-border-dark space-y-1 text-xs">
                  <div className="flex justify-between font-extrabold text-deep-green">
                    <span>TYPE:</span>
                    <span>{opp.type}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-text-main/70 text-[11px]">
                    <span>ELIGIBILITY:</span>
                    <span>{opp.eligibility}</span>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-border-dark/20 flex items-center justify-between gap-4">
                <span className="text-xs font-extrabold text-text-main flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> Deadline: {opp.deadline}
                </span>

                <button
                  onClick={() => handleApply(opp)}
                  className="brutal-btn brutal-btn-primary text-xs py-2 px-5"
                >
                  <span>View Opportunity</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};

export default FundingIncubation;
