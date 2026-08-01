/* Typed API endpoint registry.
 * Feature phases add their own module (auth, ideas, teams, agents, gamification)
 * here instead of scattering axios calls through components. */

import { apiClient, unwrap } from "@/api/client";

export const healthApi = {
  liveness: () => unwrap<{ status: string }>(apiClient.get("/health")),
  readiness: () => unwrap<{ status: string }>(apiClient.get("/health/ready")),
};
