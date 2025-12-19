// src/components/ApplyJobModal.tsx
import { motion } from "framer-motion";
import { X, Upload } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useApplyToJob } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";

interface ApplyJobModalProps {
  readonly open: boolean;
  readonly jobId: string | null;
  readonly jobTitle?: string;
  readonly onClose: () => void;
}

interface ApplyFormState {
  coverLetter: string;
  phone: string;
  cvFile: File | null;
}

export function ApplyJobModal({
  open,
  jobId,
  jobTitle,
  onClose,
}: ApplyJobModalProps) {
  const applyMutation = useApplyToJob();

  const [form, setForm] = useState<ApplyFormState>({
    coverLetter: "",
    phone: "",
    cvFile: null,
  });

  /* Reset form khi mở modal */
  useEffect(() => {
    if (open) {
      setForm({
        coverLetter: "",
        phone: "",
        cvFile: null,
      });
    }
  }, [open]);

  if (!open || !jobId) {
    return null;
  }

  const updateField = <K extends keyof ApplyFormState>(
    key: K,
    value: ApplyFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.coverLetter.trim()) {
      toast.warning("Vui lòng nhập thư ứng tuyển");
      return;
    }

    if (!form.cvFile) {
      toast.warning("Vui lòng tải lên CV");
      return;
    }

    try {
      const res = await applyMutation.mutateAsync({
        jobId,
        coverLetter: form.coverLetter,
        phone: form.phone || undefined,
        cvFile: form.cvFile,
      });

      toast.success(res.message || "Ứng tuyển thành công");
      onClose();
    } catch (err: unknown) {
      toast.error("Không thể ứng tuyển", {
        description: getAxiosErrorMessage(err),
      });
    }
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
        exit={{ opacity: 0 }}
        onClick={onClose}
      />

      {/* MODAL */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          className="
            relative w-full max-w-lg
            bg-white rounded-2xl p-6
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]
            border border-blue-100
          "
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-semibold text-blue-700">
                Ứng tuyển công việc
              </h3>
              {jobTitle && <p className="text-sm text-gray-500">{jobTitle}</p>}
            </div>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cover letter */}
          <div className="mb-4">
            <label
              htmlFor="coverLetter"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Thư ứng tuyển <span className="text-red-500">*</span>
            </label>
            <textarea
              id="coverLetter"
              rows={4}
              value={form.coverLetter}
              onChange={(e) => updateField("coverLetter", e.target.value)}
              placeholder="Giới thiệu ngắn gọn về bản thân và lý do bạn chọn vị trí này..."
              className="
                w-full rounded-xl border border-gray-300
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Phone */}
          <div className="mb-4">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Số điện thoại
            </label>
            <input
              id="phone"
              type="tel"
              value={form.phone}
              onChange={(e) => updateField("phone", e.target.value)}
              placeholder="VD: 090xxxxxxx"
              autoComplete="off"
              className="
                w-full rounded-xl border border-gray-300
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* CV upload */}
          <div className="mb-6">
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              CV <span className="text-red-500">*</span>
            </label>

            <label
              className="
                flex items-center justify-center gap-2
                w-full rounded-xl border-2 border-dashed border-gray-300
                px-4 py-3 text-sm text-gray-600
                cursor-pointer hover:border-blue-400 hover:text-blue-600
                transition
              "
            >
              <Upload size={18} />
              {form.cvFile ? form.cvFile.name : "Chọn file CV (PDF, DOCX...)"}
              <input
                id="cv"
                type="file"
                accept=".pdf,.doc,.docx"
                className="hidden"
                onChange={(e) =>
                  updateField("cvFile", e.target.files?.[0] ?? null)
                }
              />
            </label>
          </div>

          {/* Actions */}
          <button
            disabled={applyMutation.isPending}
            onClick={() => {
              void handleSubmit();
            }}
            className={`
              w-full rounded-xl py-2 text-white font-semibold cursor-pointer
              ${
                applyMutation.isPending
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {applyMutation.isPending ? "Đang gửi hồ sơ..." : "Ứng tuyển ngay"}
          </button>
        </motion.div>
      </div>
    </>
  );
}
