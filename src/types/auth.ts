import type { AppRole } from "../../shared/constants/roles";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  globalRole: AppRole;
  activeGroupId: string | null;
  memberships: Array<{
    groupId: string;
    groupName: string;
    role: AppRole;
  }>;
};

export type MeResponse = {
  user: AuthUser;
};
