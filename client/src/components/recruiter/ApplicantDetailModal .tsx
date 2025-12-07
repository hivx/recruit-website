// src/components/recruiter/ApplicantDetailModal.tsx
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";
import { useReviewApplicant } from "@/hooks";
import type { Application, ReviewApplicantPayload } from "@/types";
import { resolveImage, formatDateDMY } from "@/utils";

interface ApplicantDetailModalProps {
  readonly app: Application | null;
  readonly open: boolean;
  readonly onClose: () => void;
}

export function ApplicantDetailModal({
  app,
  open,
  onClose,
}: ApplicantDetailModalProps) {
  const reviewMutation = useReviewApplicant();

  /** LOẠI REVIEW (accepted / rejected) */
  const [reviewMode, setReviewMode] = useState<null | "accepted" | "rejected">(
    null,
  );

  /** SHOW / HIDE POPUP MINI */
  const [showPopup, setShowPopup] = useState(false);

  /** NOTE */
  const [note, setNote] = useState("");

  if (!app) {
    return null;
  }

  const avatar = resolveImage(app.applicant?.avatar);
  const appliedDate = formatDateDMY(app.createdAt);

  /** SUBMIT REVIEW */
  function handleReviewSubmit() {
    if (!reviewMode || !app) {
      return;
    }

    if (reviewMode === "rejected" && note.trim().length === 0) {
      alert("Vui lòng nhập lý do từ chối!");
      return;
    }

    const payload: ReviewApplicantPayload = {
      status: reviewMode,
      note: note.trim() || undefined,
    };

    // Đóng popup ngay lập tức
    setShowPopup(false);

    const modeBackup = reviewMode;
    setReviewMode(null);

    reviewMutation.mutate(
      { id: app.id, payload },
      {
        onSuccess: () => {
          setNote("");
          onClose(); // đóng modal lớn
        },
        onError: () => {
          // mở lại popup nếu request lỗi
          setReviewMode(modeBackup);
          setShowPopup(true);
        },
      },
    );
  }

  return (
    <>
      {/* ================= MAIN MODAL ================= */}
      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.85, opacity: 0, y: 40 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.85, opacity: 0 }}
              transition={{ type: "spring", stiffness: 120, damping: 16 }}
              className="bg-white rounded-2xl p-8 shadow-xl w-full max-w-3xl space-y-6 relative"
            >
              {/* Close button */}
              <button
                onClick={onClose}
                className="absolute right-4 top-4 text-gray-500 hover:text-gray-700"
              >
                <X size={24} />
              </button>

              {/* HEADER */}
              <div className="flex items-center gap-4">
                <img
                  src={avatar}
                  alt="Avatar"
                  className="w-16 h-16 rounded-full object-cover border"
                />
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {app.applicant?.name}
                  </h2>
                  <p className="text-gray-600">{app.applicant?.email}</p>
                </div>
              </div>

              {/* INFO */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <Info label="Công việc" value={app.job?.title ?? "-"} />
                <Info label="Ngày nộp" value={appliedDate} />
                <Info label="Số điện thoại" value={app.phone ?? "Không có"} />
                <Info
                  label="Điểm phù hợp"
                  value={`${(app.fitScore * 100).toFixed(2)}%`}
                />
                <Info label="Trạng thái" value={renderStatus(app.status)} />
              </div>

              {/* COVER LETTER */}
              <div>
                <h3 className="font-semibold text-gray-700 mb-2">
                  Thư ứng tuyển
                </h3>
                <p className="bg-gray-50 p-4 rounded-lg border whitespace-pre-line leading-relaxed">
                  {app.coverLetter}
                </p>
              </div>

              {/* CV */}
              {app.cv && (
                <div>
                  <h3 className="font-semibold text-gray-700 mb-2">CV</h3>
                  <a
                    href={resolveImage(app.cv)}
                    target="_blank"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition inline-block"
                  >
                    Xem CV
                  </a>
                </div>
              )}

              {/* ACTION BUTTONS */}
              <div className="flex justify-between pt-3">
                <button
                  onClick={onClose}
                  className="px-5 py-2.5 bg-gray-200 rounded-lg hover:bg-gray-300 transition active:scale-95"
                >
                  Đóng
                </button>

                <div className="flex gap-3">
                  <button
                    disabled={reviewMutation.isPending}
                    onClick={() => {
                      setReviewMode("accepted");
                      setShowPopup(true);
                    }}
                    className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition active:scale-95 disabled:bg-green-300"
                  >
                    Duyệt
                  </button>

                  <button
                    disabled={reviewMutation.isPending}
                    onClick={() => {
                      setReviewMode("rejected");
                      setShowPopup(true);
                    }}
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition active:scale-95 disabled:bg-red-300"
                  >
                    Từ chối
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================= MINI REVIEW POPUP ================= */}
      <AnimatePresence>
        {showPopup && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[60] flex justify-center items-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-md space-y-4"
            >
              <h3 className="text-xl font-semibold text-gray-800">
                {reviewMode === "accepted"
                  ? "Duyệt ứng viên"
                  : "Từ chối ứng viên"}
              </h3>

              <textarea
                id="review-note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={
                  reviewMode === "rejected"
                    ? "Nhập lý do từ chối (bắt buộc)…"
                    : "Ghi chú cho ứng viên (không bắt buộc)…"
                }
                rows={4}
                className="w-full border rounded-lg p-3 focus:ring-2 focus:ring-blue-300"
              />

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => {
                    setShowPopup(false);
                    setReviewMode(null);
                    setNote("");
                  }}
                  className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300 transition"
                >
                  Hủy
                </button>

                <button
                  onClick={handleReviewSubmit}
                  className={`px-4 py-2 text-white rounded-lg transition active:scale-95 ${
                    reviewMode === "accepted"
                      ? "bg-green-600 hover:bg-green-700"
                      : "bg-red-600 hover:bg-red-700"
                  }`}
                >
                  Xác nhận
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

/* Info Component */
function Info({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}) {
  return (
    <div className="p-3 bg-gray-50 border rounded-lg">
      <div className="text-gray-500 text-sm">{label}</div>
      <div className="text-gray-800 font-medium">{value}</div>
    </div>
  );
}

function renderStatus(status: string): string {
  if (status === "pending") {
    return "Chờ duyệt";
  }
  if (status === "accepted") {
    return "Đã duyệt";
  }
  if (status === "rejected") {
    return "Từ chối";
  }
  return status;
}
