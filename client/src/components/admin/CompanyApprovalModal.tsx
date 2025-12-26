// src/components/admin/CompanyApprovalModal.tsx
import { motion } from "framer-motion";
import {
  X,
  Building2,
  FileText,
  MapPin,
  Globe,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useState } from "react";
import { StatusBadge } from "@/components";
import { useVerifyCompanyAdmin } from "@/hooks";
import type { Company } from "@/types";
import { resolveImage, formatDateDMY, Toast } from "@/utils";

interface Props {
  readonly open: boolean;
  readonly company: Company | null;
  readonly onClose: () => void;
}

export function CompanyApprovalModal({ open, company, onClose }: Props) {
  const [reason, setReason] = useState("");
  const verifyMutation = useVerifyCompanyAdmin();

  if (!open || !company) {
    return null;
  }

  const logoUrl = resolveImage(company.logo);
  const status = company.verification?.status;

  /* ===== ACTION HANDLERS ===== */
  const handleApprove = () => {
    verifyMutation.mutate(
      {
        companyId: company.id,
        payload: { status: "verified" },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  const handleReject = () => {
    if (!reason.trim()) {
      Toast.error("Vui lòng nhập lý do từ chối!");
      return;
    }

    verifyMutation.mutate(
      {
        companyId: company.id,
        payload: { status: "rejected", reason },
      },
      {
        onSuccess: () => {
          onClose();
        },
      },
    );
  };

  return (
    <>
      {/* OVERLAY */}
      <motion.div
        className="
          fixed inset-0 z-50
          bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-800/40
          backdrop-blur-sm
        "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          onClick={(e) => e.stopPropagation()}
          className="
            w-full max-w-2xl
            bg-white rounded-2xl
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]
            border border-blue-100
            overflow-hidden
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between px-6 py-4 border-b">
            <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
              <Building2 className="w-5 h-5" />
              Xét duyệt công ty
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X />
            </button>
          </div>

          {/* BODY */}
          <div className="px-6 py-5 space-y-6">
            {/* BASIC INFO */}
            <div className="flex gap-5">
              {/* LOGO */}
              <div className="w-20 h-20 rounded-xl border bg-gray-50 overflow-hidden flex items-center justify-center">
                {company.logo ? (
                  <img
                    src={logoUrl}
                    alt={company.legalName}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <Building2 className="w-8 h-8 text-gray-400" />
                )}
              </div>

              {/* TEXT */}
              <div className="space-y-1">
                <h3 className="text-lg font-bold">{company.legalName}</h3>
                <p className="text-sm text-gray-600">
                  Mã số thuế: {company.taxId ?? "—"}
                </p>
                <StatusBadge status={status} />
              </div>
            </div>

            {/* DETAIL GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <Info
                icon={<FileText />}
                label="Mã đăng ký kinh doanh"
                value={company.registrationNumber}
              />
              <Info
                icon={<MapPin />}
                label="Địa chỉ"
                value={company.registeredAddress}
              />
              <Info
                icon={<Globe />}
                label="Mã quốc gia"
                value={company.countryCode}
              />
              <Info
                icon={<User />}
                label="Người quản lý"
                value={company.ownerId}
              />
              <Info
                icon={<Calendar />}
                label="Ngày thành lập"
                value={formatDateDMY(company.incorporationDate)}
              />
              <Info
                icon={<Calendar />}
                label="Gửi xét duyệt"
                value={formatDateDMY(company.verification?.submittedAt)}
              />
            </div>

            {/* REJECT REASON */}
            <div>
              <label
                htmlFor="reason"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Lý do từ chối
              </label>
              <textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
                placeholder="Nhập lý do nếu từ chối công ty…"
                className="
                  w-full rounded-xl border
                  px-4 py-2
                  focus:ring-2 focus:ring-red-400/40
                  focus:border-red-400
                "
              />
            </div>
          </div>

          {/* ACTIONS */}
          <div className="px-6 py-4 border-t flex justify-end gap-3">
            <button
              onClick={handleReject}
              disabled={verifyMutation.isPending}
              className="
                inline-flex items-center gap-2
                px-4 py-2 rounded-xl
                border text-red-600
                hover:bg-red-50 cursor-pointer
              "
            >
              <XCircle size={18} />
              Từ chối
            </button>

            <button
              onClick={handleApprove}
              disabled={verifyMutation.isPending}
              className="
                inline-flex items-center gap-2
                px-5 py-2 rounded-xl
                bg-blue-600 text-white font-semibold
                hover:bg-blue-700 cursor-pointer
              "
            >
              <CheckCircle2 size={18} />
              Duyệt công ty
            </button>
          </div>
        </motion.div>
      </div>
    </>
  );
}

/* ===== SMALL INFO COMPONENT ===== */
function Info({
  icon,
  label,
  value,
}: {
  readonly icon: React.ReactNode;
  readonly label: string;
  readonly value?: string | null;
}) {
  return (
    <div className="flex items-start gap-2">
      <div className="mt-0.5 text-gray-400">{icon}</div>
      <div>
        <p className="text-xs text-gray-500">{label}</p>
        <p className="font-medium text-gray-800">{value || "—"}</p>
      </div>
    </div>
  );
}
