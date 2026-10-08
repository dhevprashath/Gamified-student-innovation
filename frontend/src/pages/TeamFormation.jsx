import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, CheckCircle2, AlertTriangle, UserPlus, ExternalLink, Sparkles } from 'lucide-react';
import { useToast } from '../context/ToastContext';

const TeamFormation = ({ activeProject }) => {
  const { addToast } = useToast();
  const [invitedList, setInvitedList] = useState([]);

  const projectNeeds = [
    { skill: 'Full Stack Dev', met: true, detail: 'Handled by Dhev Prashath (Lead Developer)' },
    { skill: 'AI / ML Engineer', met: true, detail: 'Handled by Jaipriyaa (Embedding & NLP Models)' },
    { skill: 'UI / UX Designer', met: true, detail: 'Handled by Arun Kumar (Product Design)' },
    { skill: 'Data Engineer', met: true, detail: 'Handled by Gnana Kevin (Pipelines & DB)' }
  ];

  const recommendedStudents = [
    {
      id: 'student-1',
      name: 'Dhev Prashath',
      role: 'Full Stack Developer',
      skills: ['React', 'FastAPI', 'Node.js', 'Tailwind'],
      experience: 'Lead Architect • Full Stack Venture Developer',
      matchPct: 96,
      avatarBg: 'bg-soft-blue'
    },
    {
      id: 'student-2',
      name: 'Jaipriyaa',
      role: 'AI Engineer',
      skills: ['PyTorch', 'MiniLM', 'Sentence-Transformers', 'Python'],
      experience: 'AI Researcher • NLP & Embedding Models Specialist',
      matchPct: 94,
      avatarBg: 'bg-soft-pink'
    },
    {
      id: 'student-3',
      name: 'Arun Kumar',
      role: 'UI Designer',
      skills: ['Figma', 'UI/UX', 'Neo-Brutalism', 'Design Systems'],
      experience: 'Winner @ HackCampus 2025 • Lead Product Designer',
      matchPct: 92,
      avatarBg: 'bg-soft-yellow'
    },
    {
      id: 'student-4',
      name: 'Gnana Kevin',
      role: 'Data Engineer',
      skills: ['PostgreSQL', 'Data Pipelines', 'ETL', 'Docker'],
      experience: 'Data Systems Architect • Analytics Pipelines Lead',
      matchPct: 89,
      avatarBg: 'bg-soft-lavender'
    }
  ];

  const handleInvite = (student) => {
    if (invitedList.includes(student.id)) return;
    setInvitedList((prev) => [...prev, student.id]);
    addToast({
      title: `Invite Sent to ${student.name}`,
      description: `They will receive an invitation to join ${activeProject?.title || 'your project'}.`,
      type: 'success',
      xpBonus: 40
    });
  };

  return (
    <div className="space-y-8 py-4 pb-20 max-w-5xl mx-auto">

      {/* HEADER */}
      <div className="space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-soft-green border-2 border-border-dark rounded-xl text-xs font-extrabold shadow-[2px_2px_0px_#171717]">
          <Users className="w-4 h-4 text-deep-green" />
          <span>CAMPUS TALENT MATCHMAKING</span>
        </div>
        <h1 className="text-3xl font-extrabold font-heading text-text-main">
          BUILD YOUR TEAM
        </h1>
        <p className="text-xs font-semibold text-text-main/70">
          Match with top student developers, AI engineers, UI designers, and data engineers across campus based on skill complement.
        </p>
      </div>

      {/* YOUR PROJECT NEEDS CARD */}
      <div className="brutal-card-lg p-6 bg-pure-white border-3 border-border-dark space-y-4">
        <h2 className="text-xl font-extrabold font-heading text-text-main flex items-center gap-2">
          <span>YOUR PROJECT TEAM ROLES</span>
          <span className="text-xs bg-soft-yellow border border-border-dark px-2 py-0.5 rounded font-extrabold">
            {activeProject?.title || 'AI Student Skill Matching'}
          </span>
        </h2>

        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4">
          {projectNeeds.map((need) => (
            <div
              key={need.skill}
              className="p-4 rounded-xl border-2 border-border-dark space-y-1.5 shadow-[2px_2px_0px_#171717] bg-soft-green/40"
            >
              <div className="flex items-center justify-between font-extrabold text-sm">
                <span>{need.skill}</span>
                <span>✓</span>
              </div>
              <p className="text-[11px] font-semibold text-text-main/70 leading-tight">
                {need.detail}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* RECOMMENDED STUDENTS LIST */}
      <div className="space-y-4">
        <div className="flex justify-between items-center text-xs font-extrabold text-text-main uppercase tracking-wider px-1">
          <span>RECOMMENDED TEAM MEMBERS</span>
          <span>COMPATIBILITY INDEX</span>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {recommendedStudents.map((student) => {
            const isInvited = invitedList.includes(student.id);

            return (
              <div
                key={student.id}
                className="brutal-card p-6 bg-pure-white space-y-4 brutal-card-hover flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl ${student.avatarBg} border-2 border-border-dark flex items-center justify-center font-extrabold text-base shadow-[2px_2px_0px_#171717]`}>
                        {student.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-extrabold font-heading text-text-main">
                          {student.name}
                        </h3>
                        <p className="text-xs font-bold text-deep-green">{student.role}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold uppercase text-text-main/70">MATCH</span>
                      <p className="text-xl font-extrabold font-heading text-deep-green">
                        {student.matchPct}%
                      </p>
                    </div>
                  </div>

                  <p className="text-xs font-semibold text-text-main/80">
                    {student.experience}
                  </p>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {student.skills.map((sk) => (
                      <span
                        key={sk}
                        className="text-[11px] font-extrabold bg-bg-main border border-border-dark px-2 py-0.5 rounded"
                      >
                        {sk}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-border-dark/20 flex gap-3">
                  <button className="brutal-btn brutal-btn-white text-xs py-2 px-4 flex-1">
                    View Profile
                  </button>
                  <button
                    onClick={() => handleInvite(student)}
                    disabled={isInvited}
                    className={`brutal-btn text-xs py-2 px-4 flex-1 ${
                      isInvited ? 'bg-soft-green text-text-main cursor-default' : 'brutal-btn-primary'
                    }`}
                  >
                    {isInvited ? '✓ Joined Team' : 'Invite to Team'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

    </div>
  );
};

export default TeamFormation;
