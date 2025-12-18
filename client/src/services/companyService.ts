// src/services/companyService.ts
import { api, isAxiosError } from "@/api";
import type {
  ApiError,
  CompanyRaw,
  Company,
  SubmitCompanyResponse,
  CompanyListResponseRaw,
  CompanyListResponse,
  VerifyCompanyResponseRaw,
  VerifyCompanyResponse,
  VerifyCompanyPayload,
} from "@/types";
import {
  mapCompanyRaw,
  mapCompanyListResponse,
  mapVerifyCompanyResponseRaw,
} from "@/types";

/** Lấy thông tin công ty của recruiter hiện tại */
export async function getMyCompany(): Promise<Company | null> {
  try {
    const res = await api.get<CompanyRaw>("/api/companies/me");
    return mapCompanyRaw(res.data);
  } catch (err: unknown) {
    // kiểm tra đúng kiểu AxiosError
    if (isAxiosError(err) && err.response?.status === 404) {
      return null;
    }
    throw err;
  }
}

/** Tạo công ty mới (multipart/form-data) */
export async function createCompany(formData: FormData): Promise<Company> {
  const res = await api.post<CompanyRaw>("/api/companies", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapCompanyRaw(res.data);
}

/** Cập nhật công ty (multipart/form-data) */
export async function updateCompany(formData: FormData): Promise<Company> {
  const res = await api.patch<CompanyRaw>("/api/companies/me", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return mapCompanyRaw(res.data);
}

/** Nộp xét duyệt */
export async function submitCompanyVerification(): Promise<SubmitCompanyResponse> {
  const res = await api.post<SubmitCompanyResponse>("/api/companies/me/submit");
  return res.data;
}

/**
 * ADMIN – Lấy danh sách công ty (phân trang)
 * GET /api/companies/admin
 */
export async function listCompanies(params?: {
  page?: number;
  limit?: number;
}): Promise<CompanyListResponse> {
  try {
    const res = await api.get<CompanyListResponseRaw>("/api/companies/admin", {
      params: {
        page: params?.page ?? 1,
        limit: params?.limit ?? 20,
      },
    });

    return mapCompanyListResponse(res.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      if (err.response?.status === 403) {
        throw new Error("Bạn không có quyền admin");
      }
    }
    throw err;
  }
}

/**
 * ADMIN – Lấy chi tiết công ty
 * GET /api/companies/:id
 */
export async function getCompanyDetail(companyId: string): Promise<Company> {
  if (!companyId) {
    throw new Error("Thiếu companyId");
  }

  try {
    const res = await api.get<CompanyRaw>(`/api/companies/${companyId}`);
    return mapCompanyRaw(res.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      if (err.response?.status === 404) {
        throw new Error("Không tìm thấy công ty");
      }
      if (err.response?.status === 403) {
        throw new Error("Bạn không có quyền admin");
      }
    }
    throw err;
  }
}

/**
 * ADMIN – Duyệt hoặc từ chối công ty
 * PATCH /api/company/admin/:id/verify
 */
export async function verifyCompanyAdmin(
  companyId: string,
  payload: VerifyCompanyPayload,
): Promise<VerifyCompanyResponse> {
  if (!companyId) {
    throw new Error("Thiếu companyId");
  }

  // Validate nhẹ phía FE (đỡ gọi API vô ích)
  if (
    payload.status === "rejected" &&
    (!payload.reason || payload.reason.trim().length === 0)
  ) {
    throw new Error("Vui lòng nhập lý do từ chối");
  }

  try {
    const res = await api.patch<VerifyCompanyResponseRaw>(
      `/api/companies/admin/${companyId}/verify`,
      payload,
    );

    return mapVerifyCompanyResponseRaw(res.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      const data = err.response?.data as ApiError | undefined;

      if (err.response?.status === 400) {
        throw new Error(data?.message ?? "Dữ liệu không hợp lệ");
      }

      if (err.response?.status === 403) {
        throw new Error("Bạn không có quyền admin");
      }

      if (err.response?.status === 404) {
        throw new Error("Không tìm thấy công ty");
      }
    }
    throw err;
  }
}
