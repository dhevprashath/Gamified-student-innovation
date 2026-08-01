import { create } from "zustand";

import type { User } from "@/types";

export type AuthStatus = "idle" | "authenticated" | "unauthenticated";

interface SessionState {
  user: User | null;
  status: AuthStatus;
  setUser: (user: User | null) => void;
  clearSession: () => void;
}

/**
 * Client-side session mirror.
 *
 * The source of truth for authentication is the backend's HttpOnly cookie - it is
 * never readable by JavaScript. This store only mirrors the *decoded user profile*
 * fetched from `/auth/me` (added in Phase 2); `clearSession` is called on any 401.
 */
export const useSessionStore = create<SessionState>((set) => ({
  user: null,
  status: "idle",
  setUser: (user) =>
    set({ user, status: user ? "authenticated" : "unauthenticated" }),
  clearSession: () => set({ user: null, status: "unauthenticated" }),
}));
