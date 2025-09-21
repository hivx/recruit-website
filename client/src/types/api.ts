// src/types/common.ts

/** Lỗi trả về từ BE */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

/** Chuẩn phân trang của Jobs API */
export interface PaginatedJobs<T> {
  jobs: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** Chuẩn phân trang của Applications API */
export interface PaginatedApplicants<T> {
  totalApplicants: number;
  applicants: T[];
}

/** Response chung */
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}
