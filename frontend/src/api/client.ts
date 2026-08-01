import axios, { type AxiosError, type AxiosResponse } from "axios";

import type { ApiErrorDetail, ApiResponse } from "@/types";

export class ApiError extends Error {
  readonly status: number;
  readonly errors: ApiErrorDetail[] | null;
  readonly code?: string;

  constructor(status: number, message: string, errors: ApiErrorDetail[] | null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.errors = errors;
    this.code = errors?.[0]?.code;
  }
}

/** Thin HTTP transport. Server-state (caching, retries) is owned by TanStack Query. */
export const apiClient = axios.create({
  // Relative base in dev (proxied by Vite); absolute origin in production.
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "/api/v1",
  // Required so the backend's HttpOnly session cookie is stored and sent.
  withCredentials: true,
  timeout: 20_000,
  headers: { "Content-Type": "application/json" },
});

apiClient.interceptors.response.use(
  (response: AxiosResponse<ApiResponse<unknown>>) => response,
  (error: AxiosError<ApiResponse<unknown>>) => {
    const status = error.response?.status ?? 0;
    const body = error.response?.data;

    if (status === 401) {
      // Session expired / invalid. Phase 2 will route to the login screen and
      // clear the Zustand session here; kept as a hook point for now.
    }

    const apiError = new ApiError(
      status,
      body?.message ?? error.message ?? "Network error",
      body?.errors ?? null,
    );
    return Promise.reject(apiError);
  },
);

/** Unwrap the standardized envelope, returning the typed `data` payload. */
export async function unwrap<T>(promise: Promise<AxiosResponse<ApiResponse<T>>>): Promise<T> {
  const response = await promise;
  return response.data.data as T;
}
