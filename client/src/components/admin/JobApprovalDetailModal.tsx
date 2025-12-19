// src/components/admin/JobApprovalDetailModal.tsx
import {
  Building2,
  MapPin,
  User,
  CalendarClock,
  Banknote,
  Tag as TagIcon,
  CheckCircle,
  XCircle,
  ClipboardList,
  BadgeCheck,
  SquareX,
} from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { useApproveJob, useRejectJob } from "@/hooks";
import type { Job } from "@/types";

interface JobApprovalDetailModalProps {
  readonly open: boolean;
  readonly job: Job | null;
  readonly onClose: () => void;
}

export function JobApprovalDetailModal({
  open,
  job,
  onClose,
}: JobApprovalDetailModalProps) {
  const [confirmAction, setConfirmAction] = useState<
    "approve" | "reject" | null
  >(null);
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  const [rejectReason, setRejectReason] = useState("");

  const approveJob = useApproveJob();
  const rejectJob = useRejectJob();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) {
      return;
    }

    if (confirmAction && !dialog.open) {
      dialog.showModal();
    }

    if (!confirmAction && dialog.open) {
      dialog.close();
    }
  }, [confirmAction]);

  if (!open || !job) {
    return null;
  }
  const currentJob = job;

  const status = currentJob.approval?.status ?? "pending";
  const isPending =
    status === "pending" || status === "rejected" || status === "approved";
  const isLoading = approveJob.isPending || rejectJob.isPending;

  const statusMeta = {
    approved: {
      label: "Đã duyệt",
      className: "bg-green-100 text-green-700",
      icon: <CheckCircle className="h-4 w-4" />,
    },
    rejected: {
      label: "Từ chối",
      className: "bg-red-100 text-red-700",
      icon: <XCircle className="h-4 w-4" />,
    },
    pending: {
      label: "Chưa duyệt",
      className: "bg-yellow-100 text-yellow-700",
      icon: <ClipboardList className="h-4 w-4" />,
    },
  } as const;

  const meta = statusMeta[status];

  const salaryText =
    currentJob.salaryMin && currentJob.salaryMax
      ? `${currentJob.salaryMin.toLocaleString()} – ${currentJob.salaryMax.toLocaleString()}`
      : "Thỏa thuận";

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center">
      <div className="bg-white rounded-2xl w-full max-w-4xl p-8 shadow-xl overflow-y-auto max-h-[90vh]">
        {/* ===== HEADER ===== */}
        <div className="flex justify-between items-start gap-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">
              {currentJob.title}
            </h2>
            <div className="mt-2 flex items-center gap-4 text-sm text-gray-600">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4 text-blue-500" />
                {currentJob.company?.legalName ?? "—"}
              </span>
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4 text-blue-500" />
                {currentJob.location ?? "—"}
              </span>
            </div>
          </div>

          <button
            onClick={() => !isLoading && onClose()}
            className="text-gray-400 hover:text-gray-600 cursor-pointer"
          >
            <SquareX className="w-8 h-8" />
          </button>
        </div>

        {/* ===== STATUS ===== */}
        <div className="mt-4">
          <span
            className={`inline-flex items-center gap-2 px-3 py-1 text-sm rounded-full ${meta.className}`}
          >
            {meta.icon}
            {meta.label}
          </span>
        </div>

        {/* ===== META INFO ===== */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-blue-500" />
            Người đăng: {currentJob.createdByName ?? "—"}
          </div>

          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-blue-500" />
            Ngày cập nhật:{" "}
            {new Date(currentJob.updatedAt).toLocaleDateString("vi-VN")}
          </div>

          <div className="flex items-center gap-2">
            <Banknote className="h-4 w-4 text-blue-500" />
            Mức lương: {salaryText}
          </div>

          {currentJob.approval?.auditedAt && (
            <div className="flex items-center gap-2">
              <BadgeCheck className="h-4 w-4 text-green-500" />
              Ngày duyệt:{" "}
              {new Date(currentJob.approval.auditedAt).toLocaleDateString(
                "vi-VN",
              )}
            </div>
          )}
        </div>

        {/* ===== TAGS ===== */}
        {currentJob.tags && currentJob.tags.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">
              Lĩnh vực/Ngành nghề
            </h3>
            <div className="flex flex-wrap gap-2">
              {currentJob.tags.map((t) => (
                <span
                  key={t.tagId}
                  className="inline-flex items-center gap-1 px-3 py-1 text-xs rounded-full bg-blue-50 text-blue-700"
                >
                  <TagIcon className="h-3 w-3" />
                  {t.tag?.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ===== DESCRIPTION ===== */}
        <div className="mt-8">
          <h3 className="font-semibold text-gray-800 mb-2">Mô tả công việc</h3>
          <p className="whitespace-pre-line text-gray-700">
            {currentJob.description ?? "—"}
          </p>
        </div>

        {/* ===== REQUIREMENTS ===== */}
        {currentJob.requirements && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">Yêu cầu</h3>
            <p className="whitespace-pre-line text-gray-700">
              {currentJob.requirements}
            </p>
          </div>
        )}

        {/* ===== REQUIRED SKILLS ===== */}
        {currentJob.requiredSkills && currentJob.requiredSkills.length > 0 && (
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 mb-2">
              Kỹ năng yêu cầu
            </h3>
            <ul className="space-y-2">
              {currentJob.requiredSkills.map((s) => (
                <li
                  key={s.skillId}
                  className="flex items-center justify-between rounded-lg border p-3 text-sm"
                >
                  <span className="font-medium">{s.name}</span>
                  <span className="text-gray-600">
                    Cấp {s.levelRequired} · {s.yearsRequired} năm kinh nghiệm
                    {s.mustHave && " · Ưu tiên"}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* ===== REJECT REASON ===== */}
        {status === "rejected" && currentJob.approval?.reason && (
          <div className="mt-6 rounded-lg bg-red-50 p-4 text-red-700">
            <b>Lý do từ chối:</b> {currentJob.approval.reason}
          </div>
        )}

        {/* ===== ACTIONS ===== */}
        {isPending && (
          <div className="mt-8 flex justify-end gap-4">
            <button
              disabled={isLoading}
              onClick={() => setConfirmAction("reject")}
              className="px-5 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600 cursor-pointer"
            >
              Từ chối
            </button>

            <button
              disabled={isLoading}
              onClick={() => setConfirmAction("approve")}
              className="px-5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            >
              Duyệt
            </button>
          </div>
        )}
      </div>
      {confirmAction && (
        <dialog
          ref={dialogRef}
          onClose={() => {
            setConfirmAction(null);
            setRejectReason("");
          }}
          className="
            fixed left-1/2 top-1/2
            -translate-x-1/2 -translate-y-1/2

            w-full max-w-md
            rounded-2xl p-6 shadow-xl
            bg-white

            backdrop:bg-black/40
        "
        >
          {/* HEADER */}
          <h3 className="text-lg font-bold text-gray-800 mb-2">
            {confirmAction === "approve"
              ? "Xác nhận duyệt công việc"
              : "Xác nhận từ chối công việc"}
          </h3>

          <p className="text-sm text-gray-600 mb-4">
            {confirmAction === "approve"
              ? "Bạn có chắc chắn muốn duyệt công việc này không?"
              : "Vui lòng nhập lý do từ chối để gửi cho nhà tuyển dụng."}
          </p>

          {/* TEXTAREA – CHỈ HIỆN KHI REJECT */}
          {confirmAction === "reject" && (
            <textarea
              id="inputReject"
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Nhập lý do từ chối..."
              className="
                w-full min-h-[100px]
                border rounded-xl p-3
                text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500/30
              "
            />
          )}

          {/* ACTIONS */}
          <div className="mt-6 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmAction(null);
                setRejectReason("");
              }}
              className="px-4 py-2 rounded-xl border text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              Hủy
            </button>

            <button
              type="button"
              disabled={
                isLoading ||
                (confirmAction === "reject" && !rejectReason.trim())
              }
              onClick={() => {
                if (confirmAction === "approve") {
                  approveJob.mutate(
                    { jobId: currentJob.id },
                    { onSuccess: onClose },
                  );
                }

                if (confirmAction === "reject") {
                  rejectJob.mutate(
                    {
                      jobId: currentJob.id,
                      reason: rejectReason.trim(),
                    },
                    { onSuccess: onClose },
                  );
                }
              }}
              className={`
                px-4 py-2 rounded-xl text-white cursor-pointer
                ${
                  confirmAction === "approve"
                    ? "bg-blue-600 hover:bg-blue-700"
                    : "bg-red-500 hover:bg-red-600"
                }
                disabled:opacity-60
                `}
            >
              Xác nhận
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}
