import { FileText, Trophy, Search, CheckCircle } from "lucide-react";

const activity = [
  {
    id: 1,
    type: "validation",
    content: "AI Validation completed for",
    target: "Smart Healthcare System",
    date: "2 hours ago",
    icon: CheckCircle,
    color: "text-emerald-400",
  },
  {
    id: 2,
    type: "achievement",
    content: "Unlocked new badge:",
    target: "Research Master",
    date: "5 hours ago",
    icon: Trophy,
    color: "text-amber-400",
  },
  {
    id: 3,
    type: "research",
    content: "Research Agent found 12 new papers for",
    target: "Quantum Encryption Idea",
    date: "1 day ago",
    icon: Search,
    color: "text-blue-400",
  },
  {
    id: 4,
    type: "document",
    content: "Generated pitch deck for",
    target: "EcoTrack Mobile App",
    date: "2 days ago",
    icon: FileText,
    color: "text-purple-400",
  },
];

export function RecentActivity() {
  return (
    <div className="rounded-xl glass p-6">
      <h3 className="text-lg font-semibold text-white mb-6">Recent Activity</h3>
      <div className="flow-root">
        <ul role="list" className="-mb-8">
          {activity.map((event, eventIdx) => (
            <li key={event.id}>
              <div className="relative pb-8">
                {eventIdx !== activity.length - 1 ? (
                  <span
                    className="absolute left-5 top-5 -ml-px h-full w-0.5 bg-white/10"
                    aria-hidden="true"
                  />
                ) : null}
                <div className="relative flex items-start space-x-3">
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/5 border border-white/10 ring-8 ring-background/40 backdrop-blur-md">
                      <event.icon className={`h-5 w-5 ${event.color}`} aria-hidden="true" />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1 py-1.5">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium text-gray-200 mr-1">
                        {event.content}
                      </span>
                      <span className="font-semibold text-white">
                        {event.target}
                      </span>
                    </div>
                    <div className="mt-2 text-xs text-muted-foreground/60">
                      {event.date}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
