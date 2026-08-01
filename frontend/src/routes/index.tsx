import { createBrowserRouter, Navigate } from "react-router-dom";

import { RootLayout } from "@/layouts/RootLayout";
import { DashboardLayout } from "@/layouts/DashboardLayout";

/**
 * Central route table.
 * Feature routes are lazy-loaded (React.lazy) so each module's JS is split out of
 * the main bundle and only fetched when the user visits it. `HydrateFallback` is
 * rendered while a lazy route loads, which also silences the React Router
 * "No HydrateFallback element provided" warning.
 */
function PageLoader() {
  return <div className="p-8 text-muted-foreground">Loading…</div>;
}

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: "/dashboard",
    element: <DashboardLayout />,
    HydrateFallback: PageLoader,
    children: [
      {
        index: true,
        lazy: async () => {
          const { StudentDashboard } = await import("@/features/dashboard/pages/StudentDashboard");
          return { Component: StudentDashboard };
        },
      },
      {
        path: "/dashboard", // This catches /dashboard explicit path within the layout
        lazy: async () => {
          const { StudentDashboard } = await import("@/features/dashboard/pages/StudentDashboard");
          return { Component: StudentDashboard };
        }
      }
    ],
  },
  {
    path: "/",
    element: <DashboardLayout />,
    HydrateFallback: PageLoader,
    children: [
      {
        path: "ideas/new",
        lazy: async () => {
          const { IdeaSubmissionPage } = await import("@/features/ideas/pages/IdeaSubmissionPage");
          return { Component: IdeaSubmissionPage };
        },
      },
      {
        path: "validation",
        lazy: async () => {
          const { AIValidationPage } = await import("@/features/validation/pages/AIValidationPage");
          return { Component: AIValidationPage };
        },
      },
      {
        path: "gamification",
        lazy: async () => {
          const { GamificationPage } = await import("@/features/gamification/pages/GamificationPage");
          return { Component: GamificationPage };
        },
      },
    ]
  },
  {
    path: "*",
    HydrateFallback: PageLoader,
    lazy: async () => {
      const { NotFoundPage } = await import("@/features/home/pages/NotFoundPage");
      return { Component: NotFoundPage };
    },
  },
]);
