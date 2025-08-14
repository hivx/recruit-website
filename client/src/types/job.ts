// src/types/job.ts

/** Dạng BE trả về (raw) — bám sát Mongoose schema + timestamps */
export interface JobRaw {
  _id: string;              // ObjectId -> FE dùng string
  title: string;
  tags?: string[];          // default []
  company: string;
  location?: string;
  description?: string;
  salary?: string;          // BE là String
  requirements?: string;
  createdBy: string;        // ObjectId -> string
  createdByName: string;    // required
  createdAt?: string;       // từ timestamps: true
  updatedAt?: string;       // từ timestamps: true
}

/** Kiểu FE dùng (đã “chuẩn hóa” optional & luôn là string/array) */
export interface Job {
  _id: string;
  title: string;
  tags: string[];           // luôn là array (mặc định [])
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  requirements?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;        // ISO string
  updatedAt: string;        // ISO string
}

/** Payload khi tạo/cập nhật (FE gửi lên BE) */
export interface JobCreatePayload {
  title: string;
  company: string;
  tags?: string[];
  location?: string;
  description?: string;
  salary?: string;
  requirements?: string;
  // createdBy & createdByName: BE lấy từ token/middleware -> FE không gửi
}

export type JobUpdatePayload = Partial<JobCreatePayload>;
