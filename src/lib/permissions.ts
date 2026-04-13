import type { AppRole } from "../../shared/constants/roles";

const ROLE_LEVEL: Record<AppRole, number> = {
  MEMBER: 1,
  TREASURER: 2,
  GROUP_ADMIN: 3,
  SUPER_ADMIN: 4,
};

export function hasMinimumRole(currentRole: AppRole, requiredRole: AppRole): boolean {
  return ROLE_LEVEL[currentRole] >= ROLE_LEVEL[requiredRole];
}
