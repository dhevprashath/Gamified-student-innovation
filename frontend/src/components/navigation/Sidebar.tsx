import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Lightbulb,
  Search,
  FileText,
  LineChart,
  ShieldAlert,
  Map,
  CheckSquare,
  Trophy,
  BarChart2,
  Users,
  Presentation,
  Bell,
  User,
  Settings,
} from "lucide-react";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Research", href: "/research", icon: Search },
  { name: "Patent Analysis", href: "/patent", icon: FileText },
  { name: "Competitor Analysis", href: "/competitor", icon: LineChart },
  { name: "Risk Analysis", href: "/risk", icon: ShieldAlert },
  { name: "Roadmaps", href: "/roadmaps", icon: Map },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Gamification", href: "/gamification", icon: Trophy },
  { name: "Leaderboard", href: "/leaderboard", icon: BarChart2 },
  { name: "Mentors", href: "/mentors", icon: User },
  { name: "Team", href: "/team", icon: Users },
  { name: "Pitch Generator", href: "/pitch", icon: Presentation },
];

const secondaryNavigation = [
  { name: "Notifications", href: "/notifications", icon: Bell },
  { name: "Profile", href: "/profile", icon: User },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-full w-64 flex-col border-r border-white/10 bg-background/40 backdrop-blur-xl">
      <div className="flex h-16 shrink-0 items-center px-6">
        <h1 className="text-xl font-bold tracking-tighter text-gradient">InnoQuest</h1>
      </div>
      <div className="flex flex-1 flex-col overflow-y-auto px-4 py-4 scrollbar-hide">
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname.startsWith(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  isActive
                    ? "bg-white/10 text-white"
                    : "text-muted-foreground hover:bg-white/5 hover:text-white",
                  "group flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors"
                )}
              >
                <item.icon
                  className={cn(
                    isActive ? "text-blue-400" : "text-muted-foreground group-hover:text-white",
                    "mr-3 h-5 w-5 shrink-0 transition-colors"
                  )}
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
        <div className="mt-8">
          <h3 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Account
          </h3>
          <nav className="mt-2 space-y-1">
            {secondaryNavigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className="group flex items-center rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/5 hover:text-white"
              >
                <item.icon
                  className="mr-3 h-5 w-5 shrink-0 text-muted-foreground group-hover:text-white transition-colors"
                  aria-hidden="true"
                />
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </div>
    </div>
  );
}
