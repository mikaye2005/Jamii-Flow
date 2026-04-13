import { apiGet, apiPost } from "../../lib/apiClient";
import type { MeResponse } from "../../types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiPost<MeResponse, LoginPayload>("/api/auth/login", payload);
}

export function fetchMe() {
  return apiGet<MeResponse>("/api/auth/me");
}

export function logout() {
  return apiPost<{ loggedOut: boolean }>("/api/auth/logout");
}
