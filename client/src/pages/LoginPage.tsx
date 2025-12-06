// src/pages/LoginPage.tsx
import { useState } from "react";
import { Loader } from "@/components";
import { useAppNavigate } from "@/hooks";
import { login } from "@/services";
import { useUserStore } from "@/stores";
import type { LoginPayload } from "@/types/auth";
import { getAxiosErrorMessage } from "@/utils";

export function LoginPage() {
  const navigate = useAppNavigate();
  const setUser = useUserStore((s) => s.setUser);

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setErrorMsg("");
    setLoading(true);

    try {
      const res = await login(form);
      setUser(res.user, res.token); // Zustand
      navigate("/jobs");
    } catch (err) {
      setErrorMsg(getAxiosErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        {/* Title */}
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Hệ thống tuyển dụng VIP PRO
        </h1>

        {/* Error */}
        {errorMsg && (
          <p className="text-red-600 text-center text-sm mb-4">{errorMsg}</p>
        )}

        {/* FORM */}
        <form
          onSubmit={(e) => {
            void handleLogin(e);
          }}
          className="space-y-5"
        >
          {/* EMAIL */}
          <div>
            <label
              htmlFor="email"
              className="text-sm font-medium text-gray-600"
            >
              Tài khoản
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label
              htmlFor="password"
              className="text-sm font-medium text-gray-600"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="input"
            />
          </div>

          {/* BUTTON */}
          <button type="submit" disabled={loading} className="btn-login">
            {loading ? <Loader size={20} /> : "Đăng nhập"}
          </button>
        </form>

        {/* LINKS */}
        <div className="mt-6 text-center text-sm">
          <a
            href="/forgot-password"
            className="block mt-2 text-blue-700 hover:underline"
          >
            Quên mật khẩu?
          </a>

          <p className="text-gray-700 mt-3">
            Không có tài khoản?{" "}
            <a
              href="/register"
              className="text-blue-700 font-semibold hover:underline"
            >
              Đăng ký ngay
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
