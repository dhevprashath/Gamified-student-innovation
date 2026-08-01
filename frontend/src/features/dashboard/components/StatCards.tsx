import { Lightbulb, CheckSquare, Search, Trophy } from "lucide-react";

const stats = [
  {
    name: "Active Projects",
    value: "3",
    change: "+1 this week",
    changeType: "positive",
    icon: Lightbulb,
    color: "text-blue-400",
    bgColor: "bg-blue-400/10",
  },
  {
    name: "Pending Tasks",
    value: "12",
    change: "3 due today",
    changeType: "warning",
    icon: CheckSquare,
    color: "text-amber-400",
    bgColor: "bg-amber-400/10",
  },
  {
    name: "Research Progress",
    value: "68%",
    change: "+14% from yesterday",
    changeType: "positive",
    icon: Search,
    color: "text-purple-400",
    bgColor: "bg-purple-400/10",
  },
  {
    name: "Global Rank",
    value: "#42",
    change: "Up 5 spots",
    changeType: "positive",
    icon: Trophy,
    color: "text-emerald-400",
    bgColor: "bg-emerald-400/10",
  },
];

export function StatCards() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((item) => (
        <div
          key={item.name}
          className="relative overflow-hidden rounded-xl glass p-6 transition-all hover:bg-white/5"
        >
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {item.name}
            </p>
            <div className={`p-2 rounded-lg ${item.bgColor}`}>
              <item.icon className={`h-5 w-5 ${item.color}`} aria-hidden="true" />
            </div>
          </div>
          <div className="mt-4 flex items-baseline">
            <p className="text-3xl font-semibold text-white">{item.value}</p>
          </div>
          <div className="mt-1">
            <p className={`text-sm ${item.changeType === "positive" ? "text-emerald-400" : "text-amber-400"}`}>
              {item.change}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
