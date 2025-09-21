// src/types/job.ts

/** Dữ liệu raw trả từ BE */
export interface JobRaw {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  created_by_name: string;
  created_at: string;        // ISO date string
  updated_at: string;       // ISO date string
  tags?: string[];          // BE cho phép gửi mảng string khi tạo/cập nhật
  createdAtFormatted?: string; // chỉ có khi gọi GET /jobs/:id
  isFavorite?: boolean;        // chỉ có khi user login
}

/** Kiểu chuẩn hóa để FE dùng */
export interface Job {
  id: number;
  title: string;
  company: string;
  location?: string;
  description?: string;
  salaryMin?: number;
  salaryMax?: number;
  requirements?: string;
  createdByName: string;
  createdAt: string;         // FE convert từ created_at
  updatedAt: string;         // FE convert từ updated_at
  tags: string[];
  createdAtFormatted?: string;
  isFavorite?: boolean;
}

/** Payload khi tạo mới Job */
export interface JobCreatePayload {
  title: string;
  company: string;
  location?: string;
  description?: string;
  salary_min?: number;
  salary_max?: number;
  requirements?: string;
  tags?: string[];
  // created_by_name được BE lấy từ token -> FE không gửi
}

/** Payload khi cập nhật Job */
export type JobUpdatePayload = Partial<JobCreatePayload>;

/** Tag phổ biến (theo API /api/jobs/popular-tags) */
export interface PopularTag {
  tag: string;
  count: number;
}

/** Danh sách tag (theo API /api/jobs/tags) */
// Use string directly instead of Tag type alias
