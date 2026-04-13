import type { Context } from "hono";
import { getHealthStatus } from "../services/healthService";
import { ok } from "../utils/http";

export function healthController(c: Context) {
  return ok(c, getHealthStatus());
}
