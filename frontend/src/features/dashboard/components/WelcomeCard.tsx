import { Sparkles, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export function WelcomeCard() {
  return (
    <div className="relative overflow-hidden rounded-2xl glass-card p-8">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -mt-16 -mr-16 h-64 w-64 rounded-full bg-blue-500/10 blur-[64px]" />
      <div className="absolute bottom-0 left-0 -mb-16 -ml-16 h-64 w-64 rounded-full bg-purple-500/10 blur-[64px]" />
      
      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-sm font-medium text-purple-300">
            <Sparkles className="mr-2 h-4 w-4" />
            Level 4 Innovator
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, Alex!
          </h2>
          <p className="max-w-xl text-muted-foreground text-lg">
            You're 240 XP away from reaching Level 5. Your AI Idea Validation is ready for review.
          </p>
        </div>
        
        <div className="flex shrink-0 items-center gap-4">
          <Link
            to="/ideas/new"
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-primary px-8 py-4 font-medium text-white shadow-lg transition-all hover:scale-105 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-background"
          >
            <span className="relative z-10 flex items-center">
              Submit New Idea
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </span>
            <div className="absolute inset-0 z-0 h-full w-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 transition-opacity group-hover:opacity-100" />
          </Link>
        </div>
      </div>
      
      {/* Progress Bar */}
      <div className="relative z-10 mt-8 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-white">Level 4 Progress</span>
          <span className="text-sm font-medium text-muted-foreground">760 / 1000 XP</span>
        </div>
        <div className="h-3 w-full rounded-full bg-white/5 overflow-hidden">
          <div className="h-full bg-gradient-primary rounded-full transition-all duration-1000 ease-out" style={{ width: "76%" }} />
        </div>
      </div>
    </div>
  );
}
