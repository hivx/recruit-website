// src/types/auth.ts
import type { User } from "@/types";

/** Enum Role theo schema Prisma */
export type Role = "admin" | "recruiter" | "applicant";

/** Payload khi đăng ký */
export interface RegisterPayload {
  name: string;
  email: string; // phải là @gmail.com
  password: string;
  role: Role;
}

/** Payload khi đăng nhập */
export interface LoginPayload {
  email: string;
  password: string;
}

/** Response khi đăng nhập */
export interface LoginResponse {
  token: string;
  user: User; // Thông tin user theo schema mới
}

/** Response khi đăng ký */
export interface RegisterResponse {
  message: string; // "Đăng ký thành công. Vui lòng kiểm tra email..."
  user?: User; //  có thể backend trả về user nếu đã tạo xong
}

/** Payload khi quên mật khẩu */
export interface ForgotPasswordPayload {
  email: string;
}

/** Payload khi đặt lại mật khẩu (sau khi nhấn link xác nhận) */
export interface ResetPasswordPayload {
  token: string; // reset_token từ email
  newPassword: string;
  confirmPassword: string;
}

/** Response khi gửi email quên mật khẩu */
export interface ForgotPasswordResponse {
  message: string; // "Liên kết xác nhận đã được gửi..."
}

/** Response khi đặt lại mật khẩu */
export interface ResetPasswordResponse {
  message: string; // "Mật khẩu đã được đặt lại thành công!"
}
