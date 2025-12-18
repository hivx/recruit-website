// src/hooks/useMyCompany.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMyCompany,
  createCompany,
  updateCompany,
  submitCompanyVerification,
  listCompanies,
  getCompanyDetail,
  verifyCompanyAdmin,
} from "@/services";
import type {
  Company,
  CompanyListResponse,
  VerifyCompanyResponse,
  VerifyCompanyPayload,
} from "@/types";
import { Toast } from "@/utils";

// Retrieve recruiter’s company
export function useMyCompany() {
  return useQuery<Company | null, Error>({
    queryKey: ["my-company"],
    queryFn: getMyCompany,
    retry: false,
    select: (data) => data ?? null,
  });
}

// Create company
export function useCreateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => createCompany(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}

// Update company
export function useUpdateCompany() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (formData: FormData) => updateCompany(formData),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}

// Submit verification
export function useSubmitCompanyVerification() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitCompanyVerification,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["my-company"] });
    },
  });
}

interface UseAdminCompaniesParams {
  page?: number;
  limit?: number;
}

/**
 * ADMIN – Lấy danh sách công ty (phân trang)
 */
export function useListCompanies(params?: UseAdminCompaniesParams) {
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 20;

  return useQuery<CompanyListResponse, Error>({
    queryKey: ["admin-companies", page, limit],
    queryFn: () => listCompanies({ page, limit }),
    placeholderData: (previousData) => previousData,
  });
}

/**
 * Lấy chi tiết công ty theo ID
 */
export function useCompanyDetail(companyId?: string) {
  return useQuery<Company, Error>({
    queryKey: ["admin-company-detail", companyId],
    queryFn: () => {
      if (!companyId) {
        throw new Error("Thiếu companyId");
      }
      return getCompanyDetail(companyId);
    },
    enabled: Boolean(companyId),
  });
}

interface VerifyCompanyAdminInput {
  companyId: string;
  payload: VerifyCompanyPayload;
}

/**
 * ADMIN – Duyệt hoặc từ chối công ty
 */
export function useVerifyCompanyAdmin() {
  const queryClient = useQueryClient();

  return useMutation<VerifyCompanyResponse, Error, VerifyCompanyAdminInput>({
    mutationFn: ({ companyId, payload }) =>
      verifyCompanyAdmin(companyId, payload),

    onSuccess: async (_res, { companyId, payload }) => {
      // Toast theo trạng thái
      if (payload.status === "verified") {
        Toast.success("Công ty đã được duyệt thành công");
      } else {
        Toast.success("Đã từ chối công ty");
      }

      // Invalidate danh sách công ty admin
      await queryClient.invalidateQueries({
        queryKey: ["admin-companies"],
      });

      // Invalidate chi tiết công ty nếu đang mở
      await queryClient.invalidateQueries({
        queryKey: ["admin-company-detail", companyId],
      });

      // Nếu admin đang xem recruiter ở context khác
      await queryClient.invalidateQueries({
        queryKey: ["my-company"],
      });
    },

    onError: (err) => {
      Toast.error(err.message || "Không thể duyệt công ty");
    },
  });
}
