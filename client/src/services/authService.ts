import { api } from "@/api";
import type { LoginPayload, LoginResponse } from "@/types/auth";

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await api.post("/api/auth/login", data);
  return res.data;
}
