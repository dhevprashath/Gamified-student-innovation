import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCheck, Star, Calendar, MessageSquare, CheckCircle2, Search, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const MentorMarketplace = ({ activeProject }) => {
  const { addToast } = useToast();
  const [requestedMentors, setRequestedMentors] = useState([]);
  const [filterDomain, setFilterDomain] = useState('All');

  const mentors = [
    {
      id: 'mentor-1',
      name: 'Ms. Divya AP',
      domain: 'Academic & Research',
      title: 'Assistant Professor & Student Innovation Mentor',
      experience: '10+ years • Academic Advisor & Student Research Head',
      skills: ['Research Guidance', 'Capstone Advisory', 'Intellectual Property'],
      rating: 4.9,
      reviews: 42,
      availability: 'Available This Week',
      avatarBg: 'bg-soft-yellow'
    },
    {
      id: 'mentor-2',
      name: 'Sundar Pichai',
      domain: 'AI & Tech Scaling',
      title: 'CEO of Google & Alphabet',
      experience: '20+ years • Global Tech Scale & AI Product Leadership',
      skills: ['AI Strategy', 'Global Product Scale', 'Cloud Ecosystems'],
      rating: 5.0,
      reviews: 128,
      availability: '1 slot left',
      avatarBg: 'bg-soft-green'
    },
    {
      id: 'mentor-3',
      name: 'Ritesh Agarwal',
      domain: 'Venture Founding & Scaling',
      title: 'Founder & CEO of OYO',
      experience: 'Thiel Fellow • Built $10B+ Global Hospitality Network',
      skills: ['Startup Scaling', 'Thiel Fellowship', 'Operations Strategy'],
      rating: 4.9,
      reviews: 95,
      availability: 'Available Tomorrow',
      avatarBg: 'bg-soft-pink'
    },
    {
      id: 'mentor-4',
      name: 'Sridhar Vembu',
      domain: 'SaaS & Bootstrapped Ventures',
      title: 'Founder & CEO of Zoho',
      experience: '25+ years • Bootstrapped Multi-Billion Dollar SaaS Pioneer',
      skills: ['Bootstrapping', 'SaaS Architecture', 'Rural Innovation'],
      rating: 5.0,
      reviews: 110,
      availability: 'Available This Weekend',
      avatarBg: 'bg-soft-lavender'
    }
  ];

  const handleRequestSession = (mentor) => {
    if (requestedMentors.includes(mentor.id)) return;
    setRequestedMentors((prev) => [...prev, mentor.id]);
    addToast({
      title: `Session Requested with ${mentor.name}`,
      description: `Request for "${activeProject?.title || 'your project'}" sent successfully!`,
      type: 'success',
      xpBonus: 50
    });
  };

  const filteredMentors = filterDomain === 'All' 
    ? mentors 
    : mentors.filter(m => m.domain.toLowerCase().includes(filterDomain.toLowerCase()) || m.title.toLowerCase().includes(filterDomain.toLowerCase()));

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-pink border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <UserCheck className="w-4 h-4 text-deep-green" />
          <span>STARTUP MENTOR NETWORK</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-text-main">
          FIND YOUR MENTOR
        </h1>
        <p className="text-xs font-semibold text-text-main/70">
          Book 1-on-1 advice sessions with academic advisors, global tech CEOs, and legendary startup founders.
        </p>
      </div>

      {/* DOMAIN FILTER BAR */}
      <div className="brutal-card p-3 bg-pure-white flex flex-wrap gap-2 items-center">
        <span className="text-xs font-extrabold uppercase mr-2 text-text-main/70">FILTER DOMAIN:</span>
        {['All', 'Academic', 'AI', 'Founding', 'SaaS'].map((dom) => (
          <button
            key={dom}
            onClick={() => setFilterDomain(dom)}
            className={`brutal-btn py-1.5 px-3.5 text-xs ${
              filterDomain === dom ? 'brutal-btn-primary' : 'brutal-btn-white'
            }`}
          >
            {dom}
          </button>
        ))}
      </div>

      {/* MARKETPLACE GRID */}
      <div className="grid md:grid-cols-2 gap-6">
        {filteredMentors.map((mentor) => {
          const isRequested = requestedMentors.includes(mentor.id);
          const initials = mentor.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

          return (
            <div
              key={mentor.id}
              className="brutal-card p-6 bg-pure-white space-y-4 brutal-card-hover flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-14 h-14 rounded-2xl ${mentor.avatarBg} border-3 border-border-dark flex items-center justify-center font-extrabold text-xl shadow-[3px_3px_0px_#171717]`}>
                      {initials}
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold font-heading text-text-main">
                        {mentor.name}
                      </h3>
                      <p className="text-xs font-bold text-deep-green">{mentor.title}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 bg-soft-yellow border border-border-dark px-2 py-0.5 rounded font-extrabold text-xs">
                    <Star className="w-3.5 h-3.5 fill-current text-deep-green" />
                    <span>{mentor.rating}</span>
                  </div>
                </div>

                <p className="text-xs font-semibold text-text-main/80">
                  {mentor.experience}
                </p>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {mentor.skills.map((sk) => (
                    <span
                      key={sk}
                      className="text-[11px] font-extrabold bg-bg-main border border-border-dark px-2 py-0.5 rounded"
                    >
                      {sk}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-3 border-t border-border-dark/20 flex items-center justify-between gap-4">
                <span className="text-xs font-extrabold text-deep-green">
                  ● {mentor.availability}
                </span>

                <button
                  onClick={() => handleRequestSession(mentor)}
                  disabled={isRequested}
                  className={`brutal-btn text-xs py-2 px-5 ${
                    isRequested ? 'bg-soft-green text-text-main cursor-default' : 'brutal-btn-primary'
                  }`}
                >
                  {isRequested ? '✓ Session Requested' : 'Request Session'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

export default MentorMarketplace;
