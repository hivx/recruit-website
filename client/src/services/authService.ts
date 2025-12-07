// src/services/authService.ts
import { api } from "@/api";
import type {
  LoginPayload,
  LoginResponse,
  RegisterPayload,
  RegisterResponse,
  ForgotPasswordPayload,
  ForgotPasswordResponse,
  GetMeResponse,
  User,
} from "@/types";

// POST api/auth/login
export async function login(data: LoginPayload): Promise<LoginResponse> {
  const res = await api.post<LoginResponse>("/api/auth/login", data);
  return res.data;
}

// POST api/auth/register
export async function register(
  data: RegisterPayload,
): Promise<RegisterResponse> {
  const res = await api.post<RegisterResponse>("/api/auth/register", data);
  return res.data;
}

// POST api/auth/forgot-password
export async function forgotPassword(
  data: ForgotPasswordPayload,
): Promise<ForgotPasswordResponse> {
  const res = await api.post<ForgotPasswordResponse>(
    "/api/auth/forgot-password",
    data,
  );
  return res.data;
}

// GET api/auth/me
// Lấy thống tin người dùng hiện tai
export async function getMe(): Promise<User> {
  const res = await api.get<GetMeResponse>("/api/auth/me");
  if (res.data.user === null) {
    throw new Error("User not found");
  }
  return res.data.user;
}
