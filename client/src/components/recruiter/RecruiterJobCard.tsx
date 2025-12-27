// src/components/RecruiterJobCard.tsx
import { AlertTriangle, CheckCircle2, Clock3, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import type { Job } from "@/types";
import { resolveImage, getJobDates, formatSalary } from "@/utils";

type RecruiterJobCardProps = Readonly<{
  job: Job;
}>;

export function RecruiterJobCard({ job }: RecruiterJobCardProps) {
  const logoUrl = resolveImage(job.company?.logo);

  /* =============================
     SALARY DISPLAY
  ============================= */
  const salaryText = formatSalary(job.salaryMin, job.salaryMax);

  /* =============================
     DATE LOGIC
  ============================= */
  const { postedDate, updatedDate, isOutdated } = getJobDates(
    job.createdAt,
    job.updatedAt,
  );

  return (
    <div
      className="
        bg-white rounded-xl border
        p-5
        h-[360px]
        flex flex-col
        shadow-sm
        hover:shadow-lg hover:border-blue-300
        transition-all duration-300
      "
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start gap-3">
        {/* LOGO */}
        <Link
          to={`/recruiter/jobs/${job.id}`}
          className="
            w-16 h-16 shrink-0 
            flex items-center justify-center
            rounded-lg border bg-gray-50
            hover:border-blue-300 transition
          "
        >
          <img
            src={logoUrl}
            alt="logo"
            className="w-14 h-14 object-contain"
            onError={(e) => {
              e.currentTarget.src = resolveImage(null);
            }}
          />
        </Link>

        {/* TITLE + COMPANY */}
        <div className="flex-1">
          <h2 className="text-base font-semibold text-gray-900 hover:text-blue-600">
            {job.title}
          </h2>
          <p className="text-sm text-gray-600 font-medium">
            {job.company?.legalName}
          </p>
        </div>
      </div>

      {/* ================= BODY ================= */}
      <div className="flex-1 mt-3 space-y-2">
        {/* DATES */}
        <div className="space-y-0.5">
          <p className="text-xs text-gray-400">Đăng ngày {postedDate}</p>

          <p className="flex items-center gap-1 text-xs text-gray-400">
            Cập nhật {updatedDate}
            {isOutdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Quá 6 tháng chưa cập nhật!
              </span>
            )}
          </p>
        </div>

        {/* BADGE */}
        <ApprovalBadge status={job.approval?.status} />
        {job.approval?.status === "rejected" && job.approval.reason && (
          <p className="text-xs text-red-600 italic line-clamp-5">
            Lý do: {job.approval.reason}
          </p>
        )}
      </div>

      {/* ================= FOOTER ================= */}
      <div className="space-y-2">
        {/* SALARY + LOCATION */}
        <div className="flex flex-wrap gap-2">
          {salaryText && (
            <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-md">
              {salaryText}
            </span>
          )}

          {job.location && (
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
              {job.location}
            </span>
          )}
        </div>

        {/* TAGS */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 max-h-[56px] overflow-hidden">
            {job.tags.map((t) => (
              <span
                key={t.tag?.id}
                className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full"
              >
                {t.tag?.name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* =============================
   APPROVAL BADGE
============================= */
function ApprovalBadge({
  status,
}: {
  readonly status?: "approved" | "pending" | "rejected";
}) {
  if (!status) {
    return null;
  }

  switch (status) {
    case "approved":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-700 bg-green-100 px-2 py-1 rounded-full">
          <CheckCircle2 className="w-3.5 h-3.5" />
          Đã duyệt
        </span>
      );

    case "rejected":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-700 bg-red-100 px-2 py-1 rounded-full">
          <XCircle className="w-3.5 h-3.5" />
          Bị từ chối
        </span>
      );

    case "pending":
      return (
        <span className="inline-flex items-center gap-1 text-xs font-semibold text-yellow-700 bg-yellow-100 px-2 py-1 rounded-full">
          <Clock3 className="w-3.5 h-3.5" />
          Chờ duyệt
        </span>
      );
  }
}
