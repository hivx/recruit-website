// src/types/auth.ts
import type { User } from "@/types";

export interface LoginPayload {
  email: string;
  password: string;
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

export interface RegisterResponse {
  user: {
    id: string;
    name: string;
    email: string;
    role: "applicant" | "recruiter";
    avatar: string;
    isVerified: boolean;
  };
}

export interface ForgotPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ForgotPasswordResponse {
  message: string;
}
