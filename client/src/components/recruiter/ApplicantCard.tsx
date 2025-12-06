// src/components/recruiter/ApplicantCard.tsx
import { Phone, Mail, FileText } from "lucide-react";
import type { Application } from "@/types";
import { resolveImage } from "@/utils";

type ApplicantCardProps = Readonly<{
  app: Application;
  onClick?: () => void;
}>;

const STATUS_COLOR: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  accepted: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export function ApplicantCard({ app, onClick }: ApplicantCardProps) {
  const avatarUrl = resolveImage(app.applicant?.avatar);

  const appliedDate = app.createdAt
    ? new Date(app.createdAt).toLocaleString("vi-VN")
    : "N/A";

  const fitPercent =
    typeof app.fitScore === "number"
      ? `${(app.fitScore * 100).toFixed(0)}%`
      : "N/A";

  const applicantName = app.applicant?.name ?? "Ứng viên ẩn danh";
  const jobTitle = app.job?.title ?? "Không rõ vị trí";
  const statusClass = STATUS_COLOR[app.status] ?? STATUS_COLOR.pending;

  const coverSnippet =
    app.coverLetter.length > 140
      ? `${app.coverLetter.slice(0, 140)}...`
      : app.coverLetter;

  return (
    <button
      type="button"
      onClick={onClick}
      className="
        group w-full text-left cursor-pointer
        p-6 rounded-2xl shadow-sm 
        bg-white
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1
        focus:outline-none focus:ring-2 focus:ring-blue-300
      "
    >
      <div className="flex gap-5">
        {/* Avatar */}
        <div
          className="
            min-w-[64px] h-[64px]
            rounded-full overflow-hidden border bg-gray-100
            flex items-center justify-center
            transition-all duration-300
            group-hover:border-blue-400
          "
        >
          <img
            src={avatarUrl}
            alt="avatar ứng viên"
            className="w-16 h-16 object-cover"
            onError={(e) => {
              e.currentTarget.src = resolveImage(null);
            }}
          />
        </div>

        {/* Info */}
        <div className="flex-1 space-y-2">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="space-y-0.5">
              <p className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {applicantName}
              </p>

              <p className="text-sm text-gray-600">
                Ứng tuyển:{" "}
                <span className="font-medium text-gray-800">{jobTitle}</span>
              </p>

              <p className="text-xs text-gray-400">Nộp lúc {appliedDate}</p>
            </div>

            <span
              className={`
                px-3 py-1 rounded-full text-xs font-semibold
                ${statusClass}
              `}
            >
              {app.status}
            </span>
          </div>

          {/* Fit score + contact */}
          <div className="flex flex-wrap items-center gap-4 text-[13px] text-gray-700">
            {/* FIT SCORE */}
            <span
              className="
                px-2 py-1 rounded-md text-xs font-semibold
                bg-blue-50 text-blue-700 border border-blue-200
              "
            >
              Độ phù hợp: {fitPercent}
            </span>

            {/* PHONE */}
            {app.phone && (
              <span className="flex items-center gap-1 text-gray-600">
                <Phone size={15} strokeWidth={1.75} className="text-blue-600" />
                {app.phone}
              </span>
            )}

            {/* EMAIL */}
            {app.applicant?.email && (
              <span className="flex items-center gap-1 text-gray-600">
                <Mail size={15} strokeWidth={1.75} className="text-blue-600" />
                {app.applicant.email}
              </span>
            )}
          </div>

          {/* Cover letter */}
          <p className="text-sm text-gray-700 leading-snug line-clamp-3">
            {coverSnippet}
          </p>

          {/* CV Link */}
          {app.cv && (
            <a
              href={resolveImage(app.cv)}
              target="_blank"
              rel="noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="
                inline-flex items-center gap-1 text-xs mt-1
                text-blue-600 hover:text-blue-700 hover:underline
                transition-colors
              "
            >
              <FileText size={15} strokeWidth={1.75} /> Xem CV
            </a>
          )}
        </div>
      </div>
    </button>
  );
}
