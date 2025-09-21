// src/types/application.ts

/** Dữ liệu raw trả từ BE */
export interface ApplicationRaw {
  id: string;               // BE trả về string ID (vd: "101")
  job_id: string;           // Job ID
  applicant_id: string;     // User ID
  cover_letter: string;
  cv?: string;              // Đường dẫn file CV (/uploads/...)
  phone?: string;
  created_at: string;       // ISO date string
}

/** Kiểu chuẩn hóa cho FE */
export interface Application {
  id: string;
  jobId: string;
  applicantId: string;
  coverLetter: string;
  cv?: string;
  phone?: string;
  createdAt: string;        // FE map từ created_at
}

/** Payload khi tạo Application (FE gửi lên BE) */
export interface ApplicationCreatePayload {
  jobId: string;
  coverLetter: string;
  phone: string;
  cv?: File; // FE gửi multipart/form-data
  // applicantId: BE lấy từ token
}

/** Payload khi cập nhật Application */
export type ApplicationUpdatePayload = Partial<ApplicationCreatePayload>;

/** Thông tin ứng viên (trả về khi recruiter xem danh sách) */
export interface ApplicantInfo {
  applicantName: string;
  applicantEmail: string;
  applicantAvatar: string;
  coverLetter: string;
  cv: string;
  phone: string;
  appliedAt: string; // ISO date string
}

/** Response khi tạo application thành công */
export interface ApplicationResponse {
  message: string;          // "Ứng tuyển thành công!"
  application: Application;
}
