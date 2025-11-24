// src/types/user.ts

export type UserRole = "admin" | "recruiter" | "applicant";

/** Dữ liệu raw trả từ BE */
export interface UserRaw {
  id: string;              // BigInt → string
  name: string;
  email: string;
  isVerified: boolean;
  role: UserRole;
  avatar: string;          // BE có avatar
  created_at: string;      // ISO date string
  updated_at?: string;     // ISO date string
}

/** Kiểu chuẩn hóa để FE dùng */
export interface User {
  id: string;              // FE dùng string cho an toàn (BigInt → string)
  name: string;
  email: string;
  isVerified: boolean;
  role: UserRole;
  avatar: string;
  createdAt: string;       // FE convert từ created_at
  updatedAt?: string;      // FE convert từ updated_at
}

/** Job yêu thích (theo API /api/users/favorite) */
export interface FavoriteJob {
  id: string;              // BigInt → string
  title: string;
  company: string;
  location: string;
  created_at: string;      // ISO date string
}

/** Payload khi đăng ký */
export interface UserRegisterPayload {
  name: string;
  email: string;           // phải là @gmail.com
  password: string;
  role: UserRole;          // bắt buộc chọn role (applicant, recruiter)
}

/** Payload khi đăng nhập */
export interface UserLoginPayload {
  email: string;
  password: string;
}

/** Payload khi cập nhật User */
export type UserUpdatePayload = Partial<{
  name: string;
  email: string;
  avatar: File;            // BE nhận multipart/form-data
}>;

/** Payload đổi mật khẩu */
export interface ChangePasswordInput {
  oldPassword: string;
  newPassword: string;
}

/** Response khi đổi mật khẩu */
export interface ChangePasswordResponse {
  message: string;         // "Đổi mật khẩu thành công"
}
