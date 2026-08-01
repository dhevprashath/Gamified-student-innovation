import { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, Zap, HelpCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function IdeaSubmissionPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    // Simulate AI Processing delay
    setTimeout(() => {
      navigate("/validation");
    }, 1500);
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] gap-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      {/* Main Form Area */}
      <div className="flex-1 overflow-y-auto pr-4 scrollbar-hide">
        <header className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Submit New Idea</h1>
          <p className="text-muted-foreground">Describe your innovation to get AI-powered feedback.</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-xl glass p-8 space-y-6">
            <div className="space-y-2">
              <label htmlFor="projectName" className="text-sm font-medium text-white">Project Name</label>
              <input 
                id="projectName"
                className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="e.g. EcoTrack Smart Bin"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="problem" className="text-sm font-medium text-white">Problem Statement</label>
              <textarea 
                id="problem"
                rows={4}
                className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="What specific problem are you solving?"
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="solution" className="text-sm font-medium text-white">Proposed Solution</label>
              <textarea 
                id="solution"
                rows={4}
                className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                placeholder="How does your project solve the problem?"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="domain" className="text-sm font-medium text-white">Domain</label>
                <select 
                  id="domain"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-white focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                >
                  <option className="bg-background text-white">Healthcare</option>
                  <option className="bg-background text-white">FinTech</option>
                  <option className="bg-background text-white">EdTech</option>
                  <option className="bg-background text-white">Sustainability</option>
                </select>
              </div>
              <div className="space-y-2">
                <label htmlFor="skills" className="text-sm font-medium text-white">Required Skills</label>
                <input 
                  id="skills"
                  className="w-full rounded-md border border-white/10 bg-black/20 px-4 py-3 text-white placeholder-muted-foreground focus:border-purple-500 focus:outline-none focus:ring-1 focus:ring-purple-500 transition-colors"
                  placeholder="e.g. React, Python, ML"
                />
              </div>
            </div>
            
            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={isSubmitting}
                className="group relative inline-flex items-center justify-center overflow-hidden rounded-lg bg-gradient-primary px-8 py-3 font-medium text-white shadow-lg transition-all hover:scale-105 disabled:opacity-70 disabled:hover:scale-100"
              >
                {isSubmitting ? (
                  <span className="flex items-center">
                    <Sparkles className="mr-2 h-5 w-5 animate-pulse" />
                    AI is Validating...
                  </span>
                ) : (
                  <span className="flex items-center">
                    Run AI Validation
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </span>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* AI Assistant Sidebar */}
      <div className="hidden lg:flex w-96 flex-col gap-4">
        <div className="rounded-xl glass-card p-6 h-full flex flex-col relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-10 -mr-10 h-32 w-32 rounded-full bg-purple-500/20 blur-[32px]" />
          
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-2 rounded-lg bg-purple-500/20">
              <Sparkles className="h-5 w-5 text-purple-400" />
            </div>
            <h3 className="font-semibold text-lg text-white">Inno AI Assistant</h3>
          </div>

          <div className="flex-1 space-y-6 overflow-y-auto scrollbar-hide relative z-10">
            
            {/* Suggestion Bubble */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-4 relative">
              <div className="absolute -left-2 -top-2 rounded-full bg-blue-500 p-1">
                <Lightbulb className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm text-gray-300">
                <strong className="text-white block mb-1">Tip for Problem Statement:</strong>
                Try to quantify the problem. Instead of saying "many people", specify the market size or financial loss.
              </p>
            </div>

            {/* Live Analysis Bubble */}
            <div className="rounded-lg bg-white/5 border border-white/10 p-4 relative">
              <div className="absolute -left-2 -top-2 rounded-full bg-amber-500 p-1">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <p className="text-sm text-gray-300">
                <strong className="text-white block mb-1">Market Trend:</strong>
                AI in Healthcare is growing at 37% CAGR. Consider highlighting the technical edge of your solution.
              </p>
            </div>

          </div>
          
          {/* Ask AI Input */}
          <div className="mt-4 relative z-10">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Ask AI for help..."
                className="w-full rounded-full border border-white/10 bg-black/30 px-4 py-2.5 text-sm text-white pr-10 focus:border-purple-500 focus:outline-none"
              />
              <button className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-muted-foreground hover:text-white transition-colors">
                <HelpCircle className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
      
    </div>
  );
}
