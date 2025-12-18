// src/types/user.ts
export type UserRole = "admin" | "recruiter" | "applicant";

/** Raw từ BE (toUserDTO) */
export interface UserRaw {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: UserRole;
  isVerified: boolean;
  created_at: string;
  updated_at: string;

  company: {
    id: string;
    legal_name: string;
    verificationStatus: "submitted" | "verified" | "rejected" | null;
  } | null;
}

/** FE user (camelCase) */
export interface User {
  id: string;
  name: string | null;
  email: string;
  avatar: string | null;
  role: UserRole;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;

  company: {
    id: string;
    legalName: string;
    verificationStatus: "submitted" | "verified" | "rejected" | null;
  } | null;
}

export interface GetMeResponse {
  user: UserRaw | null;
}

export interface UserSkillRaw {
  id: number;
  name: string;
  level: number;
  years: number;
  note: string | null;
}

export interface UserSkill {
  id: string;
  name: string;
  level: number;
  years: number;
  note: string | null;
}

export interface MySkillListResponseRaw {
  total: number;
  skills: UserSkillRaw[];
}

export interface MySkillListResponse {
  total: number;
  skills: UserSkill[];
}

export interface SkillPayload {
  name: string;
  level: number;
  years: number;
  note?: string | null;
}

// 1) Raw từ BE
export interface SkillOptionRaw {
  id: number;
  name: string;
}

// 2) Dùng trên FE
export interface SkillOption {
  id: string;
  name: string;
}

// 3) Nếu muốn type cho response list (mặc dù BE trả array thẳng)
export type AllSkillListResponseRaw = SkillOptionRaw[];
export type AllSkillListResponse = SkillOption[];

export interface UpdateProfilePayload {
  name?: string;
  email?: string;
  avatar?: File;
}

export interface UpdateProfileResponse {
  message: string;
  user: User;
}

export interface ChangePasswordPayload {
  oldPassword: string;
  newPassword: string;
}

/** Raw payload gửi lên BE (admin create user) */
export interface AdminCreateUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  isVerified?: boolean; // dùng làm active/deactive
}

/** Raw payload gửi lên BE (admin update user) */
export interface AdminUpdateUserPayload {
  email?: string;
  name?: string;
  role?: UserRole;
  isVerified?: boolean;
}

export interface AdminSetUserActivePayload {
  isActive: boolean;
}

/** Raw response từ BE */
export interface AdminUserListResponseRaw {
  users: UserRaw[];
  total: number;
  page: number;
  totalPages: number;
}

/** FE response */
export interface AdminUserListResponse {
  users: User[];
  total: number;
  page: number;
  totalPages: number;
}
