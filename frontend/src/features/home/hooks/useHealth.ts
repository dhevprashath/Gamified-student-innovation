import { useQuery } from "@tanstack/react-query";

import { healthApi } from "@/features/home/api/health";

export const healthKeys = {
  all: ["health"] as const,
  liveness: () => [...healthKeys.all, "liveness"] as const,
  readiness: () => [...healthKeys.all, "readiness"] as const,
};

export function useLiveness() {
  return useQuery({
    queryKey: healthKeys.liveness(),
    queryFn: healthApi.liveness,
    refetchInterval: 30_000,
    retry: 1,
  });
}

export function useReadiness() {
  return useQuery({
    queryKey: healthKeys.readiness(),
    queryFn: healthApi.readiness,
    refetchInterval: 30_000,
    retry: 1,
  });
}
