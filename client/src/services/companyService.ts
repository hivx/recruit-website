// src/services/companyService.ts
import { api, isAxiosError } from "@/api";
import type { CompanyRaw, Company, SubmitCompanyResponse } from "@/types";
import { mapCompanyRaw } from "@/types";

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
