export const APP_ROLES = ["SUPER_ADMIN", "GROUP_ADMIN", "TREASURER", "MEMBER"] as const;

export type AppRole = (typeof APP_ROLES)[number];
