// src/components/ChangePasswordForm.tsx
import { Eye, EyeOff, Lock, LockKeyhole } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";

export function ChangePasswordForm() {
  const { mutateAsync, isPending } = useChangePassword();

  const [form, setForm] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [show, setShow] = useState({
    old: false,
    new: false,
    confirm: false,
  });

  const handleChange =
    (key: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({
        ...prev,
        [key]: e.target.value,
      }));
    };

  const handleSubmit = async () => {
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      toast.error("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (form.newPassword !== form.confirmPassword) {
      toast.error("Mật khẩu mới không khớp");
      return;
    }

    try {
      const res = await mutateAsync({
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });

      toast.success("Đổi mật khẩu thành công", {
        description: res.message,
      });

      setForm({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: unknown) {
      toast.error("Đổi mật khẩu thất bại", {
        description: getAxiosErrorMessage(err),
      });
    }
  };

  const inputBase =
    "w-full rounded-lg border border-gray-300 px-10 py-2.5 text-sm " +
    "focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 " +
    "disabled:bg-gray-100 disabled:cursor-not-allowed transition";

  return (
    <div className="mt-6 rounded-xl bg-white p-6 shadow-md">
      <h2 className="mb-6 text-lg font-semibold text-blue-600">
        Cập nhật mật khẩu
      </h2>

      {/* Mật khẩu hiện tại */}
      <div className="mb-4">
        <label
          htmlFor="oldPass"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Mật khẩu hiện tại
        </label>
        <div className="relative">
          <Lock className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            id="oldPass"
            type={show.old ? "text" : "password"}
            className={inputBase}
            value={form.oldPassword}
            onChange={handleChange("oldPassword")}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, old: !s.old }))}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-blue-600"
          >
            {show.old ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Mật khẩu mới */}
      <div className="mb-4">
        <label
          htmlFor="newPass"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Mật khẩu mới
        </label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            id="newPass"
            type={show.new ? "text" : "password"}
            className={inputBase}
            value={form.newPassword}
            onChange={handleChange("newPassword")}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-blue-600"
          >
            {show.new ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Nhập lại */}
      <div className="mb-6">
        <label
          htmlFor="verifPass"
          className="mb-1 block text-sm font-medium text-gray-700"
        >
          Nhập lại mật khẩu mới
        </label>
        <div className="relative">
          <LockKeyhole className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          <input
            id="verifPass"
            type={show.confirm ? "text" : "password"}
            className={inputBase}
            value={form.confirmPassword}
            onChange={handleChange("confirmPassword")}
            disabled={isPending}
          />
          <button
            type="button"
            onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
            className="absolute right-3 top-2.5 cursor-pointer text-gray-400 hover:text-blue-600"
          >
            {show.confirm ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

      {/* Button */}
      <button
        type="button"
        onClick={() => void handleSubmit()}
        disabled={isPending}
        className="
          w-full cursor-pointer rounded-lg
          bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white
          hover:bg-blue-700 active:scale-[0.98]
          disabled:cursor-not-allowed disabled:opacity-70
          transition-all
        "
      >
        {isPending ? "Đang lưu..." : "Lưu thay đổi"}
      </button>
    </div>
  );
}
