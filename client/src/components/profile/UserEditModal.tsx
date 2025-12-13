// src/components/profile/UserEditModal.tsx
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserForm } from "@/components/profile";
import type { UserFormState } from "@/components/profile";
import { useUpdateProfile } from "@/hooks";
import { useUserStore } from "@/stores";
import type { UpdateProfilePayload } from "@/types";
import { resolveImage, getAxiosErrorMessage } from "@/utils";

interface UserEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function UserEditModal({ open, onClose }: UserEditModalProps) {
  const user = useUserStore((s) => s.user);
  const updateMutation = useUpdateProfile();

  const [form, setForm] = useState<UserFormState>({
    name: "",
    email: "",
    avatar: null,
  });

  /* Sync form khi mở modal */
  useEffect(() => {
    if (open && user) {
      setForm({
        name: user.name ?? "",
        email: user.email ?? "",
        avatar: null,
      });
    }
  }, [open, user]);

  if (!open || !user) {
    return null;
  }

  const avatarUrl = resolveImage(user.avatar ?? undefined);

  const updateField = <K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };
  const handleSubmit = async () => {
    try {
      const payload: UpdateProfilePayload = {};

      const currentName = user.name ?? "";
      const currentEmail = user.email ?? "";

      if (form.name !== currentName) {
        payload.name = form.name;
      }

      if (form.email !== currentEmail) {
        payload.email = form.email;
      }

      if (form.avatar) {
        payload.avatar = form.avatar;
      }

      const res = await updateMutation.mutateAsync(payload);

      /**
       * BE trả về:
       * { message: string, user: UserDTO }
       */
      if (res?.message) {
        // Trường hợp đổi email
        if (res.message.toLowerCase().includes("email")) {
          toast.info(res.message, {
            description: "Bạn cần xác nhận để hoàn tất thay đổi email.",
          });
        } else {
          // Trường hợp update thường
          toast.success(res.message);
        }
      } else {
        toast.success("Cập nhật thông tin thành công");
      }

      onClose();
    } catch (err: unknown) {
      toast.error("Không thể cập nhật thông tin", {
        description: getAxiosErrorMessage(err),
      });
    }
  };

  return (
    <>
      {/* OVERLAY – blur + dim giống RecruiterPreferencesModal */}
      <motion.div
        className="
        fixed inset-0 z-50
        bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-800/40
        backdrop-blur-sm
      "
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose} // click nền để đóng
      />

      {/* MODAL WRAPPER */}
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
          onClick={(e) => e.stopPropagation()} // chặn click xuyên
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-blue-700">
              Chỉnh sửa thông tin cá nhân
            </h3>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* Form */}
          <UserForm
            form={form}
            avatarUrl={avatarUrl}
            updateField={updateField}
          />

          {/* Actions */}
          <button
            disabled={updateMutation.isPending}
            onClick={() => {
              void handleSubmit();
            }}
            className={`mt-6 w-full rounded-xl py-2 text-white font-semibold cursor-pointer ${
              updateMutation.isPending
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </motion.div>
      </div>
    </>
  );
}
