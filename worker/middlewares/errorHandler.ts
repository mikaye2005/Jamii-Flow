import type { Context } from "hono";
import { HTTPException } from "hono/http-exception";
import { fail } from "../utils/http";

export function handleApiError(error: Error, c: Context) {
  if (error instanceof HTTPException) {
    return fail(c, error.message, error.status, "HTTP_EXCEPTION");
  }

  console.error("Unhandled API error", error);
  return fail(c, "Internal server error.", 500, "INTERNAL_ERROR");
}
