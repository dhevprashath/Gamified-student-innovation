import React from 'react';

export const StudentHeroIllustration = ({ className = "w-full max-w-md h-auto" }) => (
  <svg viewBox="0 0 500 400" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Background Playful Shadow Shape */}
    <rect x="20" y="30" width="460" height="350" rx="24" fill="#171717" />
    <rect x="12" y="20" width="460" height="350" rx="24" fill="#F5E58A" stroke="#171717" strokeWidth="4" />

    {/* Laptop Desk Setup */}
    <rect x="60" y="260" width="360" height="24" rx="8" fill="#E58A4E" stroke="#171717" strokeWidth="4" />
    <path d="M120 260 L100 320 H380 L360 260 Z" fill="#174C3C" stroke="#171717" strokeWidth="4" />

    {/* Laptop Base & Screen */}
    <rect x="160" y="160" width="180" height="110" rx="12" fill="#FFFFFF" stroke="#171717" strokeWidth="4" />
    <rect x="172" y="172" width="156" height="86" rx="6" fill="#A9D8F5" stroke="#171717" strokeWidth="3" />
    {/* Screen Code Lines */}
    <rect x="184" y="186" width="70" height="8" rx="4" fill="#174C3C" />
    <rect x="184" y="202" width="110" height="8" rx="4" fill="#E58A4E" />
    <rect x="184" y="218" width="90" height="8" rx="4" fill="#F5B7D2" />
    <rect x="184" y="234" width="50" height="8" rx="4" fill="#171717" />

    {/* Floating Lightbulb of Idea */}
    <g transform="translate(350, 60)">
      <circle cx="30" cy="30" r="28" fill="#F5B7D2" stroke="#171717" strokeWidth="4" />
      <path d="M 22 25 Q 30 10 38 25 Q 40 38 34 44 H 26 Q 20 38 22 25 Z" fill="#F5E58A" stroke="#171717" strokeWidth="3" />
      <rect x="25" y="44" width="10" height="6" fill="#171717" rx="2" />
      {/* Rays */}
      <line x1="30" y1="2" x2="30" y2="8" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
      <line x1="6" y1="26" x2="12" y2="26" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
      <line x1="48" y1="26" x2="54" y2="26" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
    </g>

    {/* Floating Rocket */}
    <g transform="translate(60, 60)">
      <path d="M25 5 C35 18 35 42 25 55 C15 42 15 18 25 5 Z" fill="#F5B7D2" stroke="#171717" strokeWidth="4" />
      <circle cx="25" cy="28" r="6" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
      <path d="M15 40 L5 50 L16 52 Z" fill="#E58A4E" stroke="#171717" strokeWidth="3" />
      <path d="M35 40 L45 50 L34 52 Z" fill="#E58A4E" stroke="#171717" strokeWidth="3" />
      {/* Flame */}
      <path d="M20 55 Q25 70 30 55 Z" fill="#F5E58A" stroke="#171717" strokeWidth="3" />
    </g>

    {/* Student Avatar Character */}
    <g transform="translate(200, 70)">
      {/* Head */}
      <circle cx="50" cy="45" r="32" fill="#DCEFD9" stroke="#171717" strokeWidth="4" />
      {/* Cool Glasses */}
      <rect x="30" y="38" width="18" height="14" rx="4" fill="#171717" />
      <rect x="52" y="38" width="18" height="14" rx="4" fill="#171717" />
      <line x1="48" y1="44" x2="52" y2="44" stroke="#171717" strokeWidth="3" />
      {/* Big Smile */}
      <path d="M 38 60 Q 50 72 62 60" fill="none" stroke="#171717" strokeWidth="4" strokeLinecap="round" />
      {/* Cap */}
      <path d="M 20 38 Q 50 15 80 38 Z" fill="#B9A1F5" stroke="#171717" strokeWidth="4" />
      <rect x="15" y="36" width="30" height="6" rx="3" fill="#174C3C" stroke="#171717" strokeWidth="3" />
    </g>

    {/* Playful Stickers / Badges */}
    <g transform="translate(370, 280)">
      <rect x="0" y="0" width="70" height="32" rx="8" fill="#B9A1F5" stroke="#171717" strokeWidth="3" />
      <text x="35" y="20" textAnchor="middle" fill="#171717" fontFamily="Plus Jakarta Sans" fontWeight="800" fontSize="12">100% XP</text>
    </g>
  </svg>
);

export const IdeaIconIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#F5E58A" stroke="#171717" strokeWidth="3" />
    <circle cx="32" cy="28" r="14" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
    <path d="M 26 42 H 38 V 48 H 26 Z" fill="#E58A4E" stroke="#171717" strokeWidth="3" />
    <path d="M 28 48 H 36 V 52 H 28 Z" fill="#174C3C" stroke="#171717" strokeWidth="2" />
    <line x1="32" y1="8" x2="32" y2="12" stroke="#171717" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const ResearchIconIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#A9D8F5" stroke="#171717" strokeWidth="3" />
    <rect x="16" y="16" width="32" height="36" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
    <line x1="22" y1="24" x2="42" y2="24" stroke="#174C3C" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="32" x2="38" y2="32" stroke="#E58A4E" strokeWidth="3" strokeLinecap="round" />
    <line x1="22" y1="40" x2="34" y2="40" stroke="#B9A1F5" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const TeamIconIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#DCEFD9" stroke="#171717" strokeWidth="3" />
    <circle cx="24" cy="24" r="10" fill="#F5B7D2" stroke="#171717" strokeWidth="3" />
    <path d="M12 48 C12 38 36 38 36 48" stroke="#171717" strokeWidth="3" fill="#174C3C" />
    <circle cx="42" cy="22" r="8" fill="#F5E58A" stroke="#171717" strokeWidth="3" />
    <path d="M32 48 C32 40 52 40 52 48" stroke="#171717" strokeWidth="3" fill="#E58A4E" />
  </svg>
);

export const BuildIconIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#B9A1F5" stroke="#171717" strokeWidth="3" />
    <rect x="14" y="24" width="36" height="24" rx="6" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
    <path d="M 22 24 L 32 14 L 42 24 Z" fill="#E58A4E" stroke="#171717" strokeWidth="3" />
    <rect x="26" y="34" width="12" height="14" fill="#174C3C" stroke="#171717" strokeWidth="2" />
  </svg>
);

export const PitchIconIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#F5B7D2" stroke="#171717" strokeWidth="3" />
    <path d="M16 44 L24 24 L36 34 L48 18" stroke="#171717" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
    <polygon points="48,18 40,20 46,26" fill="#171717" />
  </svg>
);

export const RocketLaunchIllustration = ({ size = 48, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <rect x="4" y="4" width="56" height="56" rx="14" fill="#E58A4E" stroke="#171717" strokeWidth="3" />
    <path d="M32 12 C44 24 44 40 32 50 C20 40 20 24 32 12 Z" fill="#FFFFFF" stroke="#171717" strokeWidth="3" />
    <circle cx="32" cy="28" r="5" fill="#174C3C" />
  </svg>
);
