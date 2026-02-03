// src/pages/ForgotPasswordPage.tsx
import { useState } from "react";
import { Loader } from "@/components";
import { useAuth } from "@/hooks";
import { PasswordInput } from "@/utils/PasswordInput";

export default function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const { forgotPassword, forgotPasswordLoading } = useAuth();
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (form.newPassword !== form.confirmPassword) {
      setMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    const ok = await forgotPassword({
      email: form.email,
      newPassword: form.newPassword,
      confirmPassword: form.confirmPassword,
    });

    if (ok) {
      setMsg("Mật khẩu đã được đặt lại, vui lòng kiểm tra email.");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">
          Đặt lại mật khẩu
        </h1>

        {msg && <p className="text-center text-blue-700 mb-4">{msg}</p>}

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-600"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              className="input"
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* NEW PASSWORD */}
          <PasswordInput
            label="Mật khẩu mới"
            value={form.newPassword}
            required
            onChange={(v) => setForm({ ...form, newPassword: v })}
          />

          {/* CONFIRM PASSWORD */}
          <PasswordInput
            label="Xác nhận mật khẩu"
            value={form.confirmPassword}
            required
            onChange={(v) => setForm({ ...form, confirmPassword: v })}
          />

          <button
            type="submit"
            disabled={forgotPasswordLoading}
            className={`btn-login transition-all duration-200 cursor-pointer ${
              forgotPasswordLoading
                ? "opacity-60 cursor-not-allowed scale-[0.98]"
                : ""
            }`}
          >
            {forgotPasswordLoading ? <Loader size={20} /> : "Xác nhận"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          <a href="/login" className="text-blue-700 hover:underline">
            ← Quay lại đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}
