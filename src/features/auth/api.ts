import { apiGet, apiPost } from "../../lib/apiClient";
import type { MeResponse } from "../../types/auth";

export type LoginPayload = {
  email: string;
  password: string;
};

export function login(payload: LoginPayload) {
  return apiPost<MeResponse, LoginPayload>("/api/auth/login", payload);
}

export type RegisterPayload = {
  groupId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  password: string;
};

export type SignupGroup = {
  id: string;
  name: string;
  code: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
};

export function register(payload: RegisterPayload) {
  return apiPost<MeResponse, RegisterPayload>("/api/auth/register", payload);
}

export function listSignupGroups() {
  return apiGet<{ groups: SignupGroup[] }>("/api/auth/register-groups");
}

export function fetchMe() {
  return apiGet<MeResponse>("/api/auth/me");
}

export function logout() {
  return apiPost<{ loggedOut: boolean }>("/api/auth/logout");
}
