import { api } from "@/api";
import type { LoginPayload, LoginResponse } from "@/types";

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", data);
  return res.data;
}
