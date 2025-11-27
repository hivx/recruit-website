import { useState } from "react";
import { api } from "@/api";
import { Loader } from "@/components";
import type { ForgotPasswordResponse } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export function ForgotPasswordPage() {
  const [form, setForm] = useState({
    email: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");
    setLoading(true);

    try {
      const res = await api.post<ForgotPasswordResponse>(
        "/api/auth/forgot-password",
        form,
      );
      setMsg(res.data.message ?? "Mật khẩu đã được cập nhật!");
    } catch (err) {
      setMsg(getAxiosErrorMessage(err));
    } finally {
      setLoading(false);
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
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
            />
          </div>

          {/* NEW PASSWORD */}
          <div>
            <label
              htmlFor="newPass"
              className="text-sm font-medium text-gray-600"
            >
              Mật khẩu mới
            </label>
            <input
              type="password"
              required
              className="input"
              value={form.newPassword}
              onChange={(e) =>
                setForm({ ...form, newPassword: e.target.value })
              }
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="verifyPass"
              className="text-sm font-medium text-gray-600"
            >
              Xác nhận mật khẩu
            </label>
            <input
              type="password"
              required
              className="input"
              value={form.confirmPassword}
              onChange={(e) =>
                setForm({ ...form, confirmPassword: e.target.value })
              }
            />
          </div>

          <button type="submit" disabled={loading} className="btn-login">
            {loading ? <Loader size={20} /> : "Xác nhận"}
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
