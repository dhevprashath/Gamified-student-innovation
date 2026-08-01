import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { App } from "@/App";
import "@/styles/globals.css";

/**
 * TanStack Query client with production-sane defaults.
 * - Server state is the single source of truth; components declare what they need
 *   with useQuery and let the client handle caching/dedup/retries.
 * - refetchOnWindowFocus is enabled so stale data refreshes when the user returns.
 */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      gcTime: 5 * 60_000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
    },
  },
});

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </StrictMode>,
);
