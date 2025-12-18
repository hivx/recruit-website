// src/components/admin/JobApprovalCard.tsx
import {
  Building2,
  MapPin,
  User,
  CalendarClock,
  Banknote,
  Tag as TagIcon,
  ChevronRight,
} from "lucide-react";
import type { Job } from "@/types";

interface JobApprovalCardProps {
  readonly job: Job;
  readonly onClick: (job: Job) => void;
}

export function JobApprovalCard({ job, onClick }: JobApprovalCardProps) {
  const status = job.approval?.status ?? "pending";

  const statusMeta = {
    approved: {
      label: "Đã duyệt",
      badge: "bg-green-100 text-green-700",
    },
    rejected: {
      label: "Từ chối",
      badge: "bg-red-100 text-red-700",
    },
    pending: {
      label: "Chưa duyệt",
      badge: "bg-yellow-100 text-yellow-700",
    },
  } as const;

  const meta = statusMeta[status];

  // ===== helpers =====
  const salaryText =
    job.salaryMin && job.salaryMax
      ? `${job.salaryMin.toLocaleString()} – ${job.salaryMax.toLocaleString()}`
      : "Thỏa thuận";

  const updatedDate = job.updatedAt
    ? new Date(job.updatedAt).toLocaleDateString("vi-VN")
    : "—";

  const tags = job.tags?.map((t) => t.tag?.name) ?? [];
  const visibleTags = tags.slice(0, 3);
  const remainingTagCount = tags.length - visibleTags.length;

  return (
    <button
      type="button"
      onClick={() => onClick(job)}
      className="
        group w-full text-left
        bg-white rounded-2xl border border-gray-200
        p-5 space-y-4
        transition-all duration-200
        hover:border-blue-300 hover:shadow-lg hover:-translate-y-0.5
        focus:outline-none focus:ring-2 focus:ring-blue-500/30 cursor-pointer
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-4">
        <h3 className="text-base font-semibold text-gray-800 leading-snug line-clamp-2">
          {job.title}
        </h3>

        <span
          className={`shrink-0 px-2.5 py-1 text-xs font-medium rounded-full ${meta.badge}`}
        >
          {meta.label}
        </span>
      </div>

      {/* ================= COMPANY + LOCATION ================= */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-sm text-gray-600">
        <span className="flex items-center gap-1.5">
          <Building2 className="h-4 w-4 text-blue-500" />
          {job.company?.legalName ?? "—"}
        </span>

        <span className="flex items-center gap-1.5">
          <MapPin className="h-4 w-4 text-blue-500" />
          {job.location ?? "—"}
        </span>
      </div>

      {/* ================= META ================= */}
      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500">
        <span className="flex items-center gap-1.5">
          <User className="h-3.5 w-3.5" />
          {job.createdByName ?? "—"}
        </span>

        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5" />
          Cập nhật: {updatedDate}
        </span>

        <span className="flex items-center gap-1.5">
          <Banknote className="h-3.5 w-3.5" />
          {salaryText}
        </span>
      </div>

      {/* ================= TAGS / FIELD ================= */}
      {visibleTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {visibleTags.map((tag) => (
            <span
              key={tag}
              className="
                inline-flex items-center gap-1
                px-2.5 py-1 text-xs font-medium
                rounded-full
                bg-blue-50 text-blue-700
              "
            >
              <TagIcon className="h-3 w-3" />
              {tag}
            </span>
          ))}

          {remainingTagCount > 0 && (
            <span className="px-2.5 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
              +{remainingTagCount}
            </span>
          )}
        </div>
      )}

      {/* ================= DESCRIPTION PREVIEW ================= */}
      {job.description && (
        <p className="text-sm text-gray-700 line-clamp-2">{job.description}</p>
      )}

      {/* ================= REJECT REASON ================= */}
      {status === "rejected" && job.approval?.reason && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
          <b>Lý do từ chối:</b> {job.approval.reason}
        </div>
      )}

      {/* ================= FOOTER HINT ================= */}
      <div className="flex items-center justify-end gap-1 text-sm text-blue-600 opacity-0 transition group-hover:opacity-100">
        <span>Xem chi tiết</span>
        <ChevronRight className="h-4 w-4" />
      </div>
    </button>
  );
}
