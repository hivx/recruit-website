// src/types/api.ts
/** Lỗi trả về từ BE */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

/** Chuẩn phân trang cho Jobs API */
export interface PaginatedJobs<T> {
  jobs: T[];
  total: number;
  page: number;
  totalPages: number;
}

/** Danh sách ứng viên theo job — BE không trả page/totalPages */
export interface PaginatedApplicants<T> {
  applicants: T[];
  totalApplicants: number;
}

/** Response chung cho mọi API */
export interface ApiResponse<T> {
  message?: string;
  data?: T;
  [key: string]: unknown;
}
