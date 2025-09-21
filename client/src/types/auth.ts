// src/types/auth.ts
import type { User } from '@/types';

/** Payload khi đăng ký */
export interface RegisterPayload {
  name: string;
  email: string; // phải là @gmail.com
  password: string;
  role: 'admin' | 'recruiter' | 'applicant';
}

/** Payload khi đăng nhập */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Response khi đăng nhập */
export interface LoginResponse {
  token: string;
  user: User;
}

/** Response khi đăng ký */
export interface RegisterResponse {
  message: string; // "Đăng ký thành công. Vui lòng kiểm tra email..."
}

/** Payload khi quên mật khẩu */
export interface ForgotPasswordPayload {
  email: string;
  newPassword: string;
  confirmPassword: string;
}

/** Response khi quên mật khẩu */
export interface ForgotPasswordResponse {
  message: string; // "Liên kết xác nhận đã được gửi..."
}
