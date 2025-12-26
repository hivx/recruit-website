// src/components/profile/UserEditModal.tsx
import { Switch } from "@headlessui/react";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { UserForm } from "@/components/profile";
import type { UserFormState } from "@/components/profile";
import { useUpdateProfile } from "@/hooks";
import { updateReceiveRecommendation } from "@/services";
import { useUserStore } from "@/stores";
import type { UpdateProfilePayload, User } from "@/types";
import { resolveImage, getAxiosErrorMessage } from "@/utils";

interface UserEditModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
}

export function UserEditModal({ open, onClose }: UserEditModalProps) {
  const user = useUserStore((s) => s.user);
  const updateUser = useUserStore((s) => s.updateUser);
  const updateMutation = useUpdateProfile();
  const [isUpdatingRecommendation, setIsUpdatingRecommendation] =
    useState(false);
  const [recommendationEnabled, setRecommendationEnabled] = useState(true);

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
      setRecommendationEnabled(user.receiveRecommendation);
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

  function buildUpdateProfilePayload(
    form: UserFormState,
    user: User,
  ): UpdateProfilePayload {
    const payload: UpdateProfilePayload = {};

    if (form.name !== (user.name ?? "")) {
      payload.name = form.name;
    }

    if (form.email !== (user.email ?? "")) {
      payload.email = form.email;
    }

    if (form.avatar) {
      payload.avatar = form.avatar;
    }

    return payload;
  }

  const handleSubmit = async () => {
    try {
      const payload = buildUpdateProfilePayload(form, user);

      const hasProfileChanges = Object.keys(payload).length > 0;
      const hasRecommendationChange =
        recommendationEnabled !== user.receiveRecommendation;

      if (hasProfileChanges) {
        const res = await updateMutation.mutateAsync(payload);
        handleProfileUpdateResponse(res);
      }

      if (hasRecommendationChange) {
        await updateRecommendationSetting(
          recommendationEnabled,
          user,
          updateUser,
          setIsUpdatingRecommendation,
        );
      }

      onClose();
    } catch (err: unknown) {
      setRecommendationEnabled(user.receiveRecommendation);
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
              className="text-gray-500 hover:text-gray-800 cursor-pointer rounded-full p-1 transition"
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
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/40 p-4">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="font-medium text-gray-800">
                  Bạn muốn nhận đề xuất từ hệ thống.
                </p>
                <p className="text-sm text-gray-600">
                  Bật để nhận email đề xuất.
                </p>
              </div>
              <Switch
                checked={recommendationEnabled}
                disabled={isUpdatingRecommendation}
                onChange={setRecommendationEnabled}
                className={`${
                  recommendationEnabled ? "bg-blue-600" : "bg-gray-300"
                } relative inline-flex h-6 w-11 items-center rounded-full transition ${
                  isUpdatingRecommendation ? "opacity-60" : ""
                }`}
              >
                <span
                  className={`${
                    recommendationEnabled ? "translate-x-6" : "translate-x-1"
                  } inline-block h-4 w-4 transform rounded-full bg-white transition`}
                />
              </Switch>
            </div>
          </div>

          {/* Actions */}
          <button
            disabled={updateMutation.isPending || isUpdatingRecommendation}
            onClick={() => {
              void handleSubmit();
            }}
            className={`mt-6 w-full rounded-xl py-2 text-white font-semibold cursor-pointer ${
              updateMutation.isPending || isUpdatingRecommendation
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {updateMutation.isPending || isUpdatingRecommendation
              ? "Đang lưu..."
              : "Lưu thay đổi"}
          </button>
        </motion.div>
      </div>
    </>
  );
}

async function updateRecommendationSetting(
  enabled: boolean,
  _user: User,
  updateUser: (u: Partial<User>) => void,
  setLoading: (v: boolean) => void,
) {
  setLoading(true);
  try {
    const updatedUser = await updateReceiveRecommendation(enabled);
    updateUser(updatedUser ?? { receiveRecommendation: enabled });
  } finally {
    setLoading(false);
  }
}

function handleProfileUpdateResponse(res?: { message?: string }) {
  if (!res?.message) {
    toast.success("Cập nhật thông tin thành công");
    return;
  }

  if (res.message.toLowerCase().includes("email")) {
    toast.info(res.message, {
      description: "Bạn cần xác nhận để hoàn tất thay đổi email.",
    });
  } else {
    toast.success(res.message);
  }
}
