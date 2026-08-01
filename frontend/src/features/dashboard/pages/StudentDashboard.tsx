import { WelcomeCard } from "@/features/dashboard/components/WelcomeCard";
import { StatCards } from "@/features/dashboard/components/StatCards";
import { RecentActivity } from "@/features/dashboard/components/RecentActivity";

export function StudentDashboard() {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      <header>
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">Dashboard</h1>
        <p className="text-muted-foreground">Overview of your innovation journey.</p>
      </header>
      
      <WelcomeCard />
      
      <StatCards />
      
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* We'll add the charts component here later, for now just recent activity */}
        <RecentActivity />
        
        {/* Placeholder for Upcoming Tasks or AI Suggestions */}
        <div className="rounded-xl glass p-6">
           <h3 className="text-lg font-semibold text-white mb-6">AI Suggestions</h3>
           <div className="space-y-4">
             {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-lg bg-white/5 border border-white/10 p-4 transition-colors hover:bg-white/10">
                  <div className="h-4 w-3/4 rounded bg-white/20 animate-pulse mb-3" />
                  <div className="h-3 w-full rounded bg-white/10 animate-pulse mb-2" />
                  <div className="h-3 w-5/6 rounded bg-white/10 animate-pulse" />
                </div>
             ))}
           </div>
        </div>
      </div>
    </div>
  );
}
