import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getAuthenticatedUserBySessionToken } from "../services/authService";
import type { AppRole } from "../../shared/constants/roles";

export const SESSION_COOKIE_NAME = "jamiiflow_session";

export type AuthContextMembership = {
  groupId: string;
  groupName: string;
  role: AppRole;
};

type AuthVariables = {
  authUserId: string;
  authGlobalRole: AppRole;
  authMemberships: AuthContextMembership[];
};

function unauthorized(message: string, code: string) {
  return {
    success: false as const,
    error: { message, code },
  };
}

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(
  async (c, next) => {
    const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionToken) {
      return c.json(unauthorized("Authentication required.", "UNAUTHENTICATED"), 401);
    }

    const authUser = await getAuthenticatedUserBySessionToken(c.env.DB, sessionToken, c.env);
    if (!authUser) {
      return c.json(unauthorized("Invalid session.", "INVALID_SESSION"), 401);
    }

    c.set("authUserId", authUser.id);
    c.set("authGlobalRole", authUser.globalRole);
    c.set("authMemberships", authUser.memberships);
    await next();
  },
);

function hasGroupAccess(c: {
  get: (key: "authGlobalRole" | "authMemberships") => AppRole | AuthContextMembership[];
}, groupId: string): boolean {
  const globalRole = c.get("authGlobalRole") as AppRole;
  if (globalRole === "SUPER_ADMIN") {
    return true;
  }
  const memberships = c.get("authMemberships") as AuthContextMembership[];
  return memberships.some((membership) => membership.groupId === groupId);
}

export function requireGroupAccessFromQuery(groupIdQueryKey = "groupId") {
  return createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(async (c, next) => {
    const groupId = c.req.query(groupIdQueryKey);
    if (!groupId) {
      return c.json(unauthorized(`${groupIdQueryKey} query parameter is required.`, "GROUP_ID_REQUIRED"), 400);
    }
    if (!hasGroupAccess(c, groupId)) {
      return c.json(unauthorized("You do not have access to this group.", "FORBIDDEN_GROUP_ACCESS"), 403);
    }
    await next();
  });
}

export function requireOptionalGroupAccessFromQuery(groupIdQueryKey = "groupId") {
  return createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(async (c, next) => {
    const groupId = c.req.query(groupIdQueryKey);
    if (!groupId) {
      await next();
      return;
    }
    if (!hasGroupAccess(c, groupId)) {
      return c.json(unauthorized("You do not have access to this group.", "FORBIDDEN_GROUP_ACCESS"), 403);
    }
    await next();
  });
}

export function requireGroupAccessFromBody(groupIdBodyKey = "groupId") {
  return createMiddleware<{ Bindings: Env; Variables: AuthVariables }>(async (c, next) => {
    const clonedRequest = c.req.raw.clone();
    const body = (await clonedRequest.json().catch(() => null)) as Record<string, unknown> | null;
    const value = body?.[groupIdBodyKey];
    const groupId = typeof value === "string" ? value : "";
    if (!groupId) {
      return c.json(unauthorized(`${groupIdBodyKey} is required in body.`, "GROUP_ID_REQUIRED"), 400);
    }
    if (!hasGroupAccess(c, groupId)) {
      return c.json(unauthorized("You do not have access to this group.", "FORBIDDEN_GROUP_ACCESS"), 403);
    }
    await next();
  });
}
