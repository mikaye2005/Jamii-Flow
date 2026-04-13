import type { ApiResponse } from "../types/api";

export class ApiError extends Error {
  status: number;
  code?: string;

  constructor(
    message: string,
    status: number,
    code?: string,
  ) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.code = code;
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(path, {
    method: "GET",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
  });

  const json = (await response.json()) as ApiResponse<T>;

  if (!response.ok || !json.success) {
    const message = json.success ? "Request failed." : json.error.message;
    const code = json.success ? undefined : json.error.code;
    throw new ApiError(message, response.status, code);
  }

  return json.data;
}

export async function apiPost<TResponse, TPayload = Record<string, unknown>>(
  path: string,
  payload?: TPayload,
): Promise<TResponse> {
  const response = await fetch(path, {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
    },
    body: payload ? JSON.stringify(payload) : undefined,
  });

  const json = (await response.json()) as ApiResponse<TResponse>;

  if (!response.ok || !json.success) {
    const message = json.success ? "Request failed." : json.error.message;
    const code = json.success ? undefined : json.error.code;
    throw new ApiError(message, response.status, code);
  }

  return json.data;
}
