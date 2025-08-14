// src/types/application.ts

/** Dạng dữ liệu thô BE trả về (raw) */
export interface ApplicationRaw {
  _id: string;                // ObjectId -> string
  job: string;                // ObjectId (ref Job)
  applicant: string;          // ObjectId (ref User)
  coverLetter: string;
  cv?: string;                 // Đường dẫn file CV
  phone?: string;              // Số điện thoại ứng viên
  createdAt: string;           // ISO date string
}

/** Kiểu FE dùng khi đã chuẩn hóa */
export interface Application {
  _id: string;
  job: string;                // Có thể sau này map sang Job object
  applicant: string;          // Có thể sau này map sang User object
  coverLetter: string;
  cv?: string;
  phone?: string;
  createdAt: string;
}

/** Payload khi tạo mới Application */
export interface ApplicationCreatePayload {
  job: string;
  coverLetter: string;
  cv?: string;
  phone?: string;
  // applicant: FE không gửi, BE lấy từ token đăng nhập
}

/** Payload khi cập nhật Application */
export type ApplicationUpdatePayload = Partial<ApplicationCreatePayload>;
