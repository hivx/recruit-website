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
  user: User | null;
}
