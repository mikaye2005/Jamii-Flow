import { getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { getAuthenticatedUserBySessionToken } from "../services/authService";

export const SESSION_COOKIE_NAME = "jamiiflow_session";

export const requireAuth = createMiddleware<{ Bindings: Env; Variables: { authUserId: string } }>(
  async (c, next) => {
    const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
    if (!sessionToken) {
      return c.json(
        { success: false as const, error: { message: "Authentication required.", code: "UNAUTHENTICATED" } },
        401,
      );
    }

    const authUser = await getAuthenticatedUserBySessionToken(c.env.DB, sessionToken);
    if (!authUser) {
      return c.json(
        { success: false as const, error: { message: "Invalid session.", code: "INVALID_SESSION" } },
        401,
      );
    }

    c.set("authUserId", authUser.id);
    await next();
  },
);
