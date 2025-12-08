// src/types/auth.ts
import type { User, UserRaw } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponseRaw {
  token: string;
  user: UserRaw;
}
export interface LoginResponse {
  token: string;
  user: User;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
  role: "admin" | "recruiter" | "applicant";
}
export interface RegisterResponseRaw {
  message: string;
  user: UserRaw;
}

export interface RegisterResponse {
  message: string;
  user: User;
}

export interface ForgotPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
