import { apiGet, apiPost } from "../../lib/apiClient";

export type Group = {
  id: string;
  name: string;
  code: string;
  description: string | null;
  default_currency: string;
  status: "ACTIVE" | "PAUSED" | "ARCHIVED";
  created_at: string;
};

export type CreateGroupPayload = {
  name: string;
  code: string;
  description?: string;
  defaultCurrency: string;
};

export function listGroups() {
  return apiGet<{ groups: Group[] }>("/api/groups");
}

export function createGroup(payload: CreateGroupPayload) {
  return apiPost<{ created: boolean }, CreateGroupPayload>("/api/groups", payload);
}
