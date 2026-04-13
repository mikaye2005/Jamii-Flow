import type { AuthUser, LoginInput } from "../../shared/schemas/auth";
import type { AppRole } from "../../shared/constants/roles";
import { createSessionToken, addDaysToNow, sha256Hex } from "../../shared/utils/auth";
import { findUserByEmail, findUserById } from "../repositories/usersRepository";
import {
  createSession,
  findActiveSessionByTokenHash,
  revokeSessionByTokenHash,
} from "../repositories/sessionsRepository";

const DEFAULT_SESSION_DAYS = 7;
const DEFAULT_MEMBER_ROLE: AppRole = "MEMBER";

export async function loginWithEmailPassword(db: D1Database, input: LoginInput) {
  const user = await findUserByEmail(db, input.email);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const passwordHash = await sha256Hex(input.password);
  if (passwordHash !== user.password_hash) {
    return null;
  }

  const sessionToken = createSessionToken();
  const tokenHash = await sha256Hex(sessionToken);
  const expiresAt = addDaysToNow(DEFAULT_SESSION_DAYS);

  await createSession(db, {
    id: crypto.randomUUID(),
    userId: user.id,
    tokenHash,
    expiresAt,
    ipAddress: null,
    userAgent: null,
  });

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: DEFAULT_MEMBER_ROLE,
  };

  return {
    sessionToken,
    authUser,
  };
}

export async function getAuthenticatedUserBySessionToken(db: D1Database, sessionToken: string) {
  const tokenHash = await sha256Hex(sessionToken);
  const session = await findActiveSessionByTokenHash(db, tokenHash);
  if (!session) {
    return null;
  }

  const user = await findUserById(db, session.user_id);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const authUser: AuthUser = {
    id: user.id,
    email: user.email,
    firstName: user.first_name,
    lastName: user.last_name,
    role: DEFAULT_MEMBER_ROLE,
  };

  return authUser;
}

export async function logoutBySessionToken(db: D1Database, sessionToken: string): Promise<void> {
  const tokenHash = await sha256Hex(sessionToken);
  await revokeSessionByTokenHash(db, tokenHash);
}
