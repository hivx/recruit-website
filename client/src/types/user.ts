// src/types/user.ts

export type UserRole = 'admin' | 'recruiter' | 'applicant';

/** Dữ liệu raw trả từ BE */
export interface UserRaw {
  _id: string;
  name: string;
  email: string;
  password?: string;       // BE thường không gửi, nhưng để optional
  isVerified: boolean;
  role: UserRole;
  favoriteJobs: string[];  // ObjectId[] -> string[]
  createdAt: string;       // ISO date string
}

/** Kiểu chuẩn hóa để FE dùng */
export interface User {
  _id: string;
  name: string;
  email: string;
  isVerified: boolean;
  role: UserRole;
  favoriteJobs: string[]; // có thể sau này map sang Job[]
  createdAt: string;
}

/** Payload khi đăng ký */
export interface UserRegisterPayload {
  name: string;
  email: string;
  password: string;
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
  password: string;
  isVerified: boolean;
  role: UserRole;
  favoriteJobs: string[];
}>;
