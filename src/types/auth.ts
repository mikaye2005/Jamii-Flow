import type { AppRole } from "../../shared/constants/roles";

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: AppRole;
};

export type MeResponse = {
  user: AuthUser;
};
