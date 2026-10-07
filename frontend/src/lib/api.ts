import type { ApiResponse } from "@/types";

export function ok<T>(message: string, data: T): Response {
  const payload: ApiResponse<T> = { success: true, message, data };
  return Response.json(payload);
}

export function fail(message: string, status = 400): Response {
  const payload: ApiResponse<null> = { success: false, message, data: null };
  return Response.json(payload, { status });
}
