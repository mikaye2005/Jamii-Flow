import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { loginSchema, registerSchema } from "../../shared/schemas/auth";
import { SESSION_COOKIE_NAME, requireAuth } from "../middlewares/authMiddleware";
import {
  getAuthenticatedUserBySessionToken,
  listSignupGroups,
  loginWithMemberCredentials,
  loginWithEmailPassword,
  logoutBySessionToken,
} from "../services/authService";
import { fail } from "../utils/http";
import { ok } from "../utils/http";

export const authRoutes = new Hono<{ Bindings: Env; Variables: { authUserId: string } }>();

authRoutes.get("/register-groups", async (c) => {
  const groups = await listSignupGroups(c.env.DB);
  return ok(c, { groups });
});

authRoutes.post("/login", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = loginSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "Invalid login payload.", 400, "INVALID_PAYLOAD");
  }

  const result = parsed.data.email
    ? await loginWithEmailPassword(c.env.DB, parsed.data, c.env)
    : await loginWithMemberCredentials(c.env.DB, parsed.data, c.env);
  if (!result) {
    return fail(c, "Invalid email or password.", 401, "INVALID_CREDENTIALS");
  }

  setCookie(c, SESSION_COOKIE_NAME, result.sessionToken, {
    httpOnly: true,
    secure: new URL(c.req.url).protocol === "https:",
    sameSite: "Lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return ok(c, { user: result.authUser });
});

authRoutes.get("/me", requireAuth, async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  if (!sessionToken) {
    return fail(c, "Authentication required.", 401, "UNAUTHENTICATED");
  }

  const authUser = await getAuthenticatedUserBySessionToken(c.env.DB, sessionToken, c.env);
  if (!authUser) {
    return fail(c, "Invalid session.", 401, "INVALID_SESSION");
  }

  return ok(c, { user: authUser });
});

authRoutes.post("/logout", async (c) => {
  const sessionToken = getCookie(c, SESSION_COOKIE_NAME);
  if (sessionToken) {
    await logoutBySessionToken(c.env.DB, sessionToken);
  }

  deleteCookie(c, SESSION_COOKIE_NAME, { path: "/" });
  return ok(c, { loggedOut: true });
});

authRoutes.post("/register", async (c) => {
  const body = await c.req.json().catch(() => null);
  const parsed = registerSchema.safeParse(body);
  if (!parsed.success) {
    return fail(c, "Invalid signup payload.", 400, "INVALID_SIGNUP_PAYLOAD");
  }

  return fail(
    c,
    "Self-signup is disabled. A facility admin must create your profile and send your access email.",
    403,
    "SELF_SIGNUP_DISABLED",
  );
});
