// Khớp với BE Job schema
export interface Job {
  _id: string;
  title: string;
  tags: string[];           // default []
  company: string;
  location?: string;
  description?: string;
  salary?: string;          // BE đang để String
  requirements?: string;
  createdBy: string;        // ObjectId -> FE dùng string
  createdByName: string;    // required
  createdAt: string;        // timestamps true -> ISO string
  updatedAt: string;        // timestamps true -> ISO string

  // field phát sinh từ BE (nếu BE có set theo user)
  isFavorite?: boolean;
}

// Khi tạo job (POST /api/jobs)
export interface JobCreatePayload {
  title: string;
  tags?: string[];
  company: string;
  location?: string;
  description?: string;
  salary?: string;
  requirements?: string;
  // createdBy & createdByName BE sẽ lấy từ token/middleware -> FE không gửi
}

// Khi cập nhật job (PUT /api/jobs/:id)
export type JobUpdatePayload = Partial<JobCreatePayload>;

// Query cho danh sách job (GET /api/jobs)
export interface JobQuery {
  search?: string;          // từ khóa tự do
  tags?: string[];          // FE sẽ join thành CSV nếu BE nhận CSV
  location?: string;
  minSalary?: number;       // nếu BE chưa hỗ trợ có thể bỏ
  maxSalary?: number;
  sort?: 'createdAt_desc' | 'salary_desc' | 'salary_asc';
  page?: number;
  limit?: number;
}
