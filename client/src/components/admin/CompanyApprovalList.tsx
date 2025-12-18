// src/components/admin/AdminCompanyList.tsx
import { ChevronLeft, ChevronRight, Building2 } from "lucide-react";
import { useState } from "react";
import { CompanyApprovalCard, CompanyApprovalModal } from "@/components/admin";
import { useListCompanies } from "@/hooks";
import type { Company } from "@/types";

export function AdminCompanyList() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const [selectedCompany, setSelectedCompany] = useState<Company | null>(null);

  const { data, isLoading, error } = useListCompanies({
    page,
    limit,
  });

  const companies = data?.companies ?? [];
  const totalPages = data?.totalPages ?? 1;

  const SKELETON_KEYS = Array.from(
    { length: limit },
    (_, i) => `company-skeleton-${i}`,
  );

  /* ===================== LOADING ===================== */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="h-40 rounded-2xl bg-gray-100 animate-pulse"
          />
        ))}
      </div>
    );
  }

  /* ===================== ERROR ===================== */
  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600">
        Không tải được danh sách công ty.
      </div>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <>
      {/* ===== LIST ===== */}
      {companies.length === 0 ? (
        <div
          className="
            rounded-2xl border border-dashed
            bg-white p-12
            text-center text-gray-500
          "
        >
          <Building2 className="mx-auto h-10 w-10 mb-3 text-blue-400" />
          <p className="text-sm">Chưa có công ty nào cần xét duyệt</p>
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 gap-6
            animate-fade-in
          "
        >
          {companies.map((company) => (
            <CompanyApprovalCard
              key={company.id}
              company={company}
              onView={() => setSelectedCompany(company)}
            />
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="
              inline-flex items-center gap-1
              px-4 py-2 rounded-xl text-sm
              border bg-white
              hover:bg-blue-50 hover:text-blue-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>

          <span
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              bg-blue-50 text-blue-700
            "
          >
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="
              inline-flex items-center gap-1
              px-4 py-2 rounded-xl text-sm
              border bg-white
              hover:bg-blue-50 hover:text-blue-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===== MODAL ===== */}
      <CompanyApprovalModal
        open={!!selectedCompany}
        company={selectedCompany}
        onClose={() => setSelectedCompany(null)}
      />
    </>
  );
}
