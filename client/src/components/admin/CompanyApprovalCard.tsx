// src/components/admin/CompanyApprovalCard.tsx
import { Building2, MapPin, User, Globe, Clock, Eye } from "lucide-react";
import { StatusBadge } from "@/components";
import type { Company } from "@/types";
import { resolveImage, formatDateDMY } from "@/utils";

interface Props {
  readonly company: Company;
  readonly onView: () => void;
}

export function CompanyApprovalCard({ company, onView }: Props) {
  const logoUrl = resolveImage(company.logo);

  return (
    <div
      className="
        w-full group
        bg-white rounded-3xl
        border border-gray-200
        p-8
        flex items-start justify-between gap-8
        shadow-sm
        hover:shadow-xl hover:-translate-y-0.5
        hover:border-blue-300
        transition-all duration-300
      "
    >
      {/* ================= LEFT ================= */}
      <div className="flex items-start gap-6 min-w-0">
        {/* LOGO */}
        <div
          className="
            w-28 h-28 rounded-2xl
            border bg-gray-50 overflow-hidden
            flex items-center justify-center
            shrink-0
          "
        >
          {company.logo ? (
            <img
              src={logoUrl}
              alt={company.legalName}
              className="w-full h-full object-cover"
            />
          ) : (
            <Building2 className="w-10 h-10 text-gray-400" />
          )}
        </div>

        {/* INFO */}
        <div className="min-w-0 space-y-3">
          {/* NAME */}
          <h3
            className="
              text-xl font-semibold text-gray-800
              leading-snug
            "
          >
            {company.legalName}
          </h3>

          {/* TAX */}
          <p className="text-sm text-gray-500">
            Mã số thuế:{" "}
            <span className="font-medium text-gray-700">
              {company.taxId ?? "—"}
            </span>
          </p>

          {/* ADDRESS */}
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <MapPin className="w-4 h-4" />
            </span>
            <span className="line-clamp-2">
              {company.registeredAddress ?? "Chưa cập nhật địa chỉ"}
            </span>
          </div>

          {/* META */}
          <div className="flex flex-wrap items-center gap-4 pt-1 text-sm text-gray-500">
            <div className="flex items-center gap-1.5">
              <span className="p-1.5 rounded-lg bg-gray-100">
                <Globe className="w-4 h-4" />
              </span>
              {company.countryCode ?? "—"}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="p-1.5 rounded-lg bg-gray-100">
                <User className="w-4 h-4" />
              </span>
              Mã người quản lý: {company.ownerId}
            </div>

            <div className="flex items-center gap-1.5">
              <span className="p-1.5 rounded-lg bg-gray-100">
                <Clock className="w-4 h-4" />
              </span>
              {formatDateDMY(company.createdAt)}
            </div>
          </div>
        </div>
      </div>

      {/* ================= RIGHT ================= */}
      <div className="flex flex-col items-end gap-4 shrink-0">
        <StatusBadge status={company.verification?.status} />

        <button
          onClick={onView}
          className="
            inline-flex items-center gap-2
            px-5 py-2.5 rounded-xl
            bg-blue-600 text-white text-sm font-semibold
            hover:bg-blue-700
            shadow-md hover:shadow-lg
            active:scale-95
            transition cursor-pointer
          "
        >
          <Eye size={18} />
          Xem chi tiết
        </button>
      </div>
    </div>
  );
}
