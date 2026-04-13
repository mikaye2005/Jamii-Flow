import type { AuthUser, LoginInput, RegisterInput } from "../../shared/schemas/auth";
import type { AppRole } from "../../shared/constants/roles";
import { createSessionToken, addDaysToNow, sha256Hex } from "../../shared/utils/auth";
import { listUserGroupAccess } from "../repositories/authzRepository";
import { listActiveGroupsPublic } from "../repositories/groupsRepository";
import {
  createGroupMembership,
  createUser,
  findUserByEmail,
  findUserById,
  findUserForMemberLogin,
} from "../repositories/usersRepository";
import {
  createSession,
  findActiveSessionByTokenHash,
  revokeSessionByTokenHash,
} from "../repositories/sessionsRepository";

const DEFAULT_SESSION_DAYS = 7;
const DEFAULT_MEMBER_ROLE: AppRole = "MEMBER";

function getSuperAdminEmails(env: Env | null): string[] {
  if (!env) {
    return [];
  }
  const source = env as unknown as Record<string, unknown>;
  const raw = source.SUPER_ADMIN_EMAILS;
  if (typeof raw !== "string") {
    return [];
  }
  return raw
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

async function buildAuthUser(
  db: D1Database,
  params: {
    user: { id: string; email: string; first_name: string; last_name: string };
    env?: Env | null;
  },
): Promise<AuthUser> {
  const memberships = await listUserGroupAccess(db, params.user.id);
  const superAdminEmails = getSuperAdminEmails(params.env ?? null);
  const globalRole: AppRole = superAdminEmails.includes(params.user.email.toLowerCase())
    ? "SUPER_ADMIN"
    : DEFAULT_MEMBER_ROLE;

  return {
    id: params.user.id,
    email: params.user.email,
    firstName: params.user.first_name,
    lastName: params.user.last_name,
    globalRole,
    activeGroupId: memberships[0]?.groupId ?? null,
    memberships,
  };
}

async function createSessionForUser(db: D1Database, userId: string) {
  const sessionToken = createSessionToken();
  const tokenHash = await sha256Hex(sessionToken);
  const expiresAt = addDaysToNow(DEFAULT_SESSION_DAYS);

  await createSession(db, {
    id: crypto.randomUUID(),
    userId,
    tokenHash,
    expiresAt,
    ipAddress: null,
    userAgent: null,
  });

  return sessionToken;
}

export async function loginWithEmailPassword(db: D1Database, input: LoginInput, env?: Env | null) {
  if (!input.email) {
    return null;
  }
  const user = await findUserByEmail(db, input.email);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const passwordHash = await sha256Hex(input.password);
  if (passwordHash !== user.password_hash) {
    return null;
  }

  const sessionToken = await createSessionForUser(db, user.id);

  const authUser = await buildAuthUser(db, { user, env: env ?? null });

  return {
    sessionToken,
    authUser,
  };
}

export async function loginWithMemberCredentials(db: D1Database, input: LoginInput, env?: Env | null) {
  if (!input.groupId || !input.facilityCode || !input.username) {
    return null;
  }
  const user = await findUserForMemberLogin(db, {
    groupId: input.groupId,
    facilityCode: input.facilityCode,
    username: input.username,
  });
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  const passwordHash = await sha256Hex(input.password);
  if (passwordHash !== user.password_hash) {
    return null;
  }

  const sessionToken = await createSessionForUser(db, user.id);
  const authUser = await buildAuthUser(db, { user, env: env ?? null });

  return {
    sessionToken,
    authUser,
  };
}

export async function getAuthenticatedUserBySessionToken(
  db: D1Database,
  sessionToken: string,
  env?: Env | null,
) {
  const tokenHash = await sha256Hex(sessionToken);
  const session = await findActiveSessionByTokenHash(db, tokenHash);
  if (!session) {
    return null;
  }

  const user = await findUserById(db, session.user_id);
  if (!user || user.status !== "ACTIVE") {
    return null;
  }

  return buildAuthUser(db, { user, env: env ?? null });
}

export async function logoutBySessionToken(db: D1Database, sessionToken: string): Promise<void> {
  const tokenHash = await sha256Hex(sessionToken);
  await revokeSessionByTokenHash(db, tokenHash);
}

export async function listSignupGroups(db: D1Database) {
  return listActiveGroupsPublic(db);
}

export async function registerMemberAccount(db: D1Database, input: RegisterInput) {
  const existingUser = await findUserByEmail(db, input.email);
  if (existingUser) {
    return { error: "EMAIL_ALREADY_EXISTS" as const };
  }

  const groups = await listActiveGroupsPublic(db);
  const targetGroup = groups.find((group) => group.id === input.groupId);
  if (!targetGroup) {
    return { error: "GROUP_NOT_AVAILABLE" as const };
  }

  const passwordHash = await sha256Hex(input.password);
  const userId = await createUser(db, {
    email: input.email,
    passwordHash,
    firstName: input.firstName,
    lastName: input.lastName,
    phone: input.phone,
  });
  await createGroupMembership(db, input.groupId, userId);

  const sessionToken = await createSessionForUser(db, userId);
  const authUser = await buildAuthUser(db, {
    user: {
      id: userId,
      email: input.email.toLowerCase(),
      first_name: input.firstName,
      last_name: input.lastName,
    },
    env: null,
  });

  return { sessionToken, authUser };
}
