// src/services/authService.ts
import { api } from "@/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
} from "@/types";

export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", data);
  return res.data;
}

export async function register(
  data: RegisterPayload,
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/api/auth/register", data);
  return res.data;
}
