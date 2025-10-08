// src/types/api.ts

/** Lỗi trả về từ BE (backend) */
export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

/**
 * Chuẩn phân trang cho Jobs API
 * - Theo schema mới:
 *   + Job.id là string (do BE trả BigInt dưới dạng string)
 *   + Job.tags là JobTag[] (gồm tagId, jobId, tag{name})
 * - Mọi API trả về danh sách jobs nên tuân theo format này
 */
export interface PaginatedJobs<T> {
  jobs: T[];          // Danh sách job (đã được mapper chuẩn hóa)
  total: number;      // Tổng số job
  page: number;       // Trang hiện tại
  totalPages: number; // Tổng số trang
}

/**
 * Chuẩn phân trang cho Applications API
 * - Dành cho danh sách ứng viên / ứng tuyển
 * - Giữ linh hoạt với page và totalPages (optional)
 */
export interface PaginatedApplicants<T> {
  applicants: T[];         // Danh sách ứng viên
  totalApplicants: number; // Tổng số ứng viên
  page?: number;
  totalPages?: number;
}

/**
 * Response chung (generic) cho mọi API
 * - BE có thể trả thêm message hoặc chỉ data
 */
export interface ApiResponse<T> {
  message?: string;
  data?: T;
}
