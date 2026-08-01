import { Outlet } from "react-router-dom";
import { Sidebar } from "@/components/navigation/Sidebar";

export function DashboardLayout() {
  return (
    <div className="flex h-screen w-full bg-background dark text-foreground overflow-hidden">
      {/* Background ambient gradients */}
      <div className="pointer-events-none fixed inset-0 flex justify-center">
        <div className="absolute -top-[20%] left-[20%] h-[500px] w-[500px] rounded-full bg-purple-600/20 blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] h-[600px] w-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
      </div>
      
      {/* Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative z-10">
        <div className="h-full w-full max-w-7xl mx-auto p-6 md:p-8 lg:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
