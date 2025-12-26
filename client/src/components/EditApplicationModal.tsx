// src/components/EditApplicationModal.tsx
import { motion } from "framer-motion";
import { X, Upload, FileText } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useUpdateApplication } from "@/hooks";
import type { Application } from "@/types";
import { resolveImage, getAxiosErrorMessage } from "@/utils";

interface EditApplicationModalProps {
  readonly open: boolean;
  readonly application: Application;
  readonly onClose: () => void;
}

interface EditApplicationFormState {
  coverLetter: string;
  phone: string;
  cvFile: File | null;
}

export function EditApplicationModal({
  open,
  application,
  onClose,
}: EditApplicationModalProps) {
  const updateMutation = useUpdateApplication();

  const [form, setForm] = useState<EditApplicationFormState>({
    coverLetter: "",
    phone: "",
    cvFile: null,
  });

  /* Sync dữ liệu cũ khi mở modal */
  useEffect(() => {
    if (open) {
      setForm({
        coverLetter: application.coverLetter,
        phone: application.phone ?? "",
        cvFile: null,
      });
    }
  }, [open, application]);

  if (!open) {
    return null;
  }

  const updateField = <K extends keyof EditApplicationFormState>(
    key: K,
    value: EditApplicationFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    const payload: {
      coverLetter?: string;
      phone?: string;
      cvFile?: File;
    } = {};

    if (form.coverLetter !== application.coverLetter) {
      payload.coverLetter = form.coverLetter;
    }

    if ((form.phone || "") !== (application.phone || "")) {
      payload.phone = form.phone || undefined;
    }

    if (form.cvFile) {
      payload.cvFile = form.cvFile;
    }

    if (Object.keys(payload).length === 0) {
      toast.info("Bạn chưa thay đổi thông tin nào");
      return;
    }

    try {
      const res = await updateMutation.mutateAsync({
        applicationId: application.id,
        payload,
      });

      toast.success(res.message || "Cập nhật hồ sơ thành công");
      onClose();
    } catch (err: unknown) {
      toast.error("Không thể cập nhật hồ sơ", {
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
          bg-black/40 backdrop-blur-sm
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
          "
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-700">
              Chỉnh sửa hồ sơ ứng tuyển
            </h3>
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
              Thư ứng tuyển
            </label>
            <textarea
              id="coverLetter"
              rows={4}
              value={form.coverLetter}
              onChange={(e) => updateField("coverLetter", e.target.value)}
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
              autoComplete="off"
              className="
                w-full rounded-xl border border-gray-300
                px-3 py-2 text-sm
                focus:outline-none focus:ring-2 focus:ring-blue-500
              "
            />
          </div>

          {/* Current CV */}
          {application.cv && (
            <a
              href={resolveImage(application.cv)}
              target="_blank"
              className="mb-3 inline-flex items-center gap-1 text-blue-600 text-xs hover:underline"
            >
              <FileText size={14} />
              Xem CV hiện tại
            </a>
          )}

          {/* Upload new CV */}
          <div className="mb-6">
            <label
              htmlFor="cv"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Tải CV mới (không bắt buộc)
            </label>
            <label
              className="
              flex items-center justify-center gap-2
              w-full rounded-xl border-2 border-dashed border-gray-300
              px-4 py-3 text-sm cursor-pointer
              hover:border-blue-400 hover:text-blue-600
            "
            >
              <Upload size={18} />
              {form.cvFile ? form.cvFile.name : "Chọn file CV mới"}
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
            disabled={updateMutation.isPending}
            onClick={() => void handleSubmit()}
            className={`
              w-full rounded-xl py-2 text-white font-semibold cursor-pointer
              ${
                updateMutation.isPending
                  ? "bg-blue-300 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </motion.div>
      </div>
    </>
  );
}
