import { apiClient, unwrap } from "@/api/client";

export const healthApi = {
  liveness: () => unwrap<{ status: string }>(apiClient.get("/health")),
  readiness: () => unwrap<{ status: string }>(apiClient.get("/health/ready")),
};
