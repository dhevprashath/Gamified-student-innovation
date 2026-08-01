import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, TrendingUp, Award } from "lucide-react";
import { Link } from "react-router-dom";

export function AIValidationPage() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">AI Validation Report</h1>
          <p className="text-muted-foreground">Analysis complete for: <span className="text-white font-medium">EcoTrack Smart Bin</span></p>
        </div>
        <Link
          to="/research"
          className="inline-flex items-center justify-center rounded-lg bg-white/10 border border-white/20 px-6 py-2.5 font-medium text-white hover:bg-white/20 transition-colors"
        >
          Proceed to Deep Research
          <ArrowRight className="ml-2 h-4 w-4" />
        </Link>
      </header>
      
      {/* Scorecards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        <div className="rounded-2xl glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-emerald-500/20 blur-[32px]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-muted-foreground mb-1">Innovation Score</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Based on market uniqueness and technical complexity.</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold text-white tracking-tighter">84</span>
              <span className="text-xl text-emerald-400">/100</span>
            </div>
          </div>
          <div className="mt-8 relative z-10">
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full" style={{ width: "84%" }} />
            </div>
          </div>
        </div>

        <div className="rounded-2xl glass-card p-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-blue-500/20 blur-[32px]" />
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-muted-foreground mb-1">Feasibility Score</h3>
              <p className="text-sm text-gray-400 max-w-[200px]">Based on required resources, time, and skills.</p>
            </div>
            <div className="flex items-baseline gap-1">
              <span className="text-6xl font-bold text-white tracking-tighter">72</span>
              <span className="text-xl text-blue-400">/100</span>
            </div>
          </div>
          <div className="mt-8 relative z-10">
            <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-indigo-400 rounded-full" style={{ width: "72%" }} />
            </div>
          </div>
        </div>

      </div>

      {/* Detailed Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        <div className="lg:col-span-2 rounded-xl glass p-6 space-y-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-400" />
            Improvement Tips
          </h3>
          
          <div className="space-y-4">
            <div className="rounded-lg bg-white/5 border border-white/10 p-5 flex gap-4">
              <div className="mt-1 p-2 rounded-full bg-amber-500/20 text-amber-400 shrink-0 h-min">
                <ShieldAlert className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Hardware Cost Risk</h4>
                <p className="text-sm text-gray-400">The proposed IoT sensors might increase the unit cost significantly. Consider validating with cheaper microcontrollers for the MVP.</p>
              </div>
            </div>

            <div className="rounded-lg bg-white/5 border border-white/10 p-5 flex gap-4">
              <div className="mt-1 p-2 rounded-full bg-emerald-500/20 text-emerald-400 shrink-0 h-min">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Strong Market Gap</h4>
                <p className="text-sm text-gray-400">Your solution addresses a high-priority sustainability issue that recently gained municipal funding in tier-1 cities.</p>
              </div>
            </div>
            
            <div className="rounded-lg bg-white/5 border border-white/10 p-5 flex gap-4">
              <div className="mt-1 p-2 rounded-full bg-blue-500/20 text-blue-400 shrink-0 h-min">
                <TrendingUp className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-medium text-white mb-1">Monetization Opportunity</h4>
                <p className="text-sm text-gray-400">You can add a B2B SaaS dashboard for waste management companies to charge a monthly subscription.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl glass p-6">
          <h3 className="text-xl font-semibold text-white flex items-center gap-2 mb-6">
            <Award className="h-5 w-5 text-purple-400" />
            Hackathon Readiness
          </h3>
          
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="h-32 w-32 rounded-full border-4 border-purple-500/30 flex items-center justify-center bg-purple-500/10">
              <span className="text-3xl font-bold text-white">65%</span>
            </div>
            <p className="text-sm text-gray-400">Your idea needs more technical validation and a competitor analysis before it is fully ready for a hackathon pitch.</p>
            
            <div className="w-full space-y-2 mt-4 text-left">
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Technical Roadmap</span>
                <span className="text-amber-400">Missing</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Competitor Analysis</span>
                <span className="text-amber-400">Pending</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-300">Pitch Deck</span>
                <span className="text-amber-400">Pending</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
