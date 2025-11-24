// src/types/application.ts

/** Trạng thái ứng tuyển (theo schema mới) */
export type ApplicationStatus = "pending" | "accepted" | "rejected";

/** Dữ liệu raw trả từ BE */
export interface ApplicationRaw {
  id: string;               // BigInt → string
  job_id: string;           // BigInt → string
  applicant_id: string;     // BigInt → string
  cover_letter: string;
  cv?: string;              // Đường dẫn file CV (/uploads/...)
  phone?: string;
  status: ApplicationStatus;
  created_at: string;       // ISO date string
}

/** Kiểu chuẩn hóa cho FE */
export interface Application {
  id: string;               // FE giữ string để an toàn
  jobId: string;
  applicantId: string;
  coverLetter: string;
  cv?: string;
  phone?: string;
  status: ApplicationStatus;
  createdAt: string;        // FE map từ created_at
}

/** Payload khi tạo Application (FE gửi lên BE) */
export interface ApplicationCreatePayload {
  jobId: string;            // FE truyền string (BigInt → string)
  coverLetter: string;
  phone: string;
  cv?: File;                // FE gửi multipart/form-data
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
  status: ApplicationStatus;
  appliedAt: string; // ISO date string
}

/** Response khi tạo application thành công */
export interface ApplicationResponse {
  message: string;          // "Ứng tuyển thành công!"
  application: Application;
}
