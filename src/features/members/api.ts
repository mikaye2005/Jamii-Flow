import { apiGet, apiPost } from "../../lib/apiClient";

export type Member = {
  membership_id: string;
  group_id: string;
  user_id: string;
  member_number: string | null;
  membership_status: "ACTIVE" | "INACTIVE" | "EXITED";
  joined_at: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
};

export type CreateMemberPayload = {
  groupId: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
};

export function listMembers(groupId: string) {
  return apiGet<{ members: Member[] }>(`/api/members?groupId=${encodeURIComponent(groupId)}`);
}

export function createMember(payload: CreateMemberPayload) {
  return apiPost<{ created: boolean }, CreateMemberPayload>("/api/members", payload);
}
