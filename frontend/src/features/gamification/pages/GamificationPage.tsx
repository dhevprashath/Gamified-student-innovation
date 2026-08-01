import { Trophy, Star, Target, Zap, Hexagon } from "lucide-react";

const badges = [
  { id: 1, name: "First Spark", description: "Submit your first idea", icon: Zap, unlocked: true, color: "text-amber-400", bg: "bg-amber-400/20" },
  { id: 2, name: "Research Guru", description: "Analyze 10 research papers", icon: Star, unlocked: true, color: "text-purple-400", bg: "bg-purple-400/20" },
  { id: 3, name: "Patent Pioneer", description: "Complete a patent scan", icon: Target, unlocked: false, color: "text-gray-500", bg: "bg-gray-800" },
  { id: 4, name: "Pitch Master", description: "Generate a winning pitch", icon: Trophy, unlocked: false, color: "text-gray-500", bg: "bg-gray-800" },
];

const challenges = [
  { id: 1, title: "Review 2 Competitors", progress: 1, total: 2, xp: 100 },
  { id: 2, title: "Invite a Teammate", progress: 0, total: 1, xp: 150 },
  { id: 3, title: "Login for 3 consecutive days", progress: 3, total: 3, xp: 50 },
];

export function GamificationPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Gamification</h1>
        <p className="text-muted-foreground">Track your progress, earn XP, and unlock achievements.</p>
      </header>

      {/* Top Banner */}
      <div className="rounded-2xl glass-card p-8 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
        <div className="absolute left-0 top-0 h-full w-1/3 bg-gradient-to-r from-purple-600/20 to-transparent blur-2xl" />
        
        <div className="flex items-center gap-6 relative z-10">
          <div className="relative">
            <Hexagon className="h-24 w-24 text-purple-500 stroke-[1.5]" />
            <div className="absolute inset-0 flex items-center justify-center flex-col">
              <span className="text-xs font-semibold text-purple-300">LEVEL</span>
              <span className="text-2xl font-bold text-white leading-none">4</span>
            </div>
          </div>
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Advanced Innovator</h2>
            <p className="text-gray-400 mb-4">Rank: #42 Globally</p>
            <div className="flex items-center gap-3">
              <div className="h-2 w-48 rounded-full bg-white/10 overflow-hidden">
                <div className="h-full bg-gradient-to-r from-purple-500 to-blue-500" style={{ width: "76%" }} />
              </div>
              <span className="text-sm font-medium text-white">760 / 1000 XP</span>
            </div>
          </div>
        </div>

        <div className="flex gap-6 relative z-10">
          <div className="text-center">
            <div className="text-3xl font-bold text-amber-400 mb-1 flex justify-center items-center gap-1">
              <Star className="h-6 w-6 fill-amber-400" />
              1,250
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Total Coins</span>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-1 flex justify-center items-center gap-1">
              <Trophy className="h-6 w-6" />
              12
            </div>
            <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Achievements</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Daily Challenges */}
        <div className="lg:col-span-1 rounded-xl glass p-6 space-y-6">
          <h3 className="text-xl font-semibold text-white">Daily Challenges</h3>
          <div className="space-y-4">
            {challenges.map(challenge => (
              <div key={challenge.id} className="rounded-lg bg-white/5 border border-white/10 p-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-medium text-white text-sm pr-4">{challenge.title}</h4>
                  <span className="text-xs font-bold text-amber-400 bg-amber-400/10 px-2 py-1 rounded">+{challenge.xp} XP</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all ${challenge.progress === challenge.total ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                      style={{ width: `${(challenge.progress / challenge.total) * 100}%` }} 
                    />
                  </div>
                  <span className="text-xs text-gray-400 whitespace-nowrap">{challenge.progress} / {challenge.total}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Badges Collection */}
        <div className="lg:col-span-2 rounded-xl glass p-6">
          <div className="flex justify-between items-center mb-6">
             <h3 className="text-xl font-semibold text-white">Badges Collection</h3>
             <span className="text-sm text-purple-400 hover:text-purple-300 cursor-pointer transition-colors">View All</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {badges.map(badge => (
              <div 
                key={badge.id} 
                className={`rounded-xl border border-white/10 p-5 flex flex-col items-center text-center transition-all ${badge.unlocked ? 'bg-white/5 hover:bg-white/10' : 'bg-black/20 opacity-60'}`}
              >
                <div className={`p-4 rounded-full mb-4 ${badge.bg}`}>
                  <badge.icon className={`h-8 w-8 ${badge.color}`} />
                </div>
                <h4 className="font-semibold text-white mb-1">{badge.name}</h4>
                <p className="text-xs text-gray-400">{badge.description}</p>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
