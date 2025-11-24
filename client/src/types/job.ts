// src/types/job.ts

/** Tag chuẩn hóa (danh mục ngành nghề / lĩnh vực) */
export interface Tag {
  id: number;
  name: string;
}

/** Liên kết giữa Job và Tag (chuẩn hóa nhiều-nhiều) */
export interface JobTag {
  jobId: string; // BE trả BigInt → FE nhận string
  tagId: number;
  tag: Tag; // Quan hệ: mỗi JobTag gắn 1 Tag
}

/** Dữ liệu raw trả từ BE (giữ snake_case để khớp JSON gốc) */
export interface JobRaw {
  id: string;                   // BigInt → string
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  salary_min?: number | null;
  salary_max?: number | null;
  requirements?: string | null;
  created_by_name: string;
  created_by: string;           // BigInt → string
  created_at: string;           // ISO date string
  updated_at: string;           // ISO date string
  tags: JobTag[];               // Mảng JobTag (đã populate tag)
  createdAtFormatted?: string;  // chỉ khi gọi GET /jobs/:id
  isFavorite?: boolean;         // chỉ khi user login
}

/** Kiểu chuẩn hóa để FE dùng (camelCase + chuyển field cần thiết) */
export interface Job {
  id: string;                   // BigInt → string
  title: string;
  company: string;
  location?: string | null;
  description?: string | null;
  salaryMin?: number | null;
  salaryMax?: number | null;
  requirements?: string | null;
  createdByName: string;
  createdBy: string;            // BigInt → string
  createdAt: string;            // FE convert từ created_at
  updatedAt: string;            // FE convert từ updated_at
  tags: JobTag[];               // Mảng JobTag với tag.name
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
  tags?: string[]; // FE gửi tên tag → BE upsert Tag + JobTag
}

/** Payload khi cập nhật Job */
export type JobUpdatePayload = Partial<JobCreatePayload>;

/** Tag phổ biến (theo API /api/jobs/popular-tags) */
export interface PopularTag {
  tagId: number;
  tagName: string;
  count: number;
}

/** Danh sách tag (theo API /api/jobs/tags) */
export interface ActiveTag {
  id: number;
  name: string;
  jobCount: number;
}
