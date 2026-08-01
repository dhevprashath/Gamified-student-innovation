/* Shared API types mirroring the backend's standardized response envelope
 * (see backend/app/core/response.py and backend/app/schemas/common.py). */

export interface ApiErrorDetail {
  code?: string;
  field?: string;
  message?: string;
}

export interface ApiMeta {
  [key: string]: unknown;
}

/** Every InnoQuest API response uses this envelope. */
export interface ApiResponse<T> {
  success: boolean;
  data: T | null;
  message: string;
  errors: ApiErrorDetail[] | null;
  meta: ApiMeta | null;
  timestamp: string;
}

export type UserRole = "student" | "mentor" | "admin";

export interface User {
  id: string;
  email: string;
  full_name: string;
  role: UserRole;
  created_at: string;
}
