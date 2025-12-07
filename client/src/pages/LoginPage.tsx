// src/pages/LoginPage.tsx
import { useState } from "react";
import { Loader } from "@/components";
import { useAppNavigate, useAuth } from "@/hooks";
import type { LoginPayload } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export function LoginPage() {
  const navigate = useAppNavigate();
  const { login, loginLoading, error } = useAuth();

  const [form, setForm] = useState<LoginPayload>({
    email: "",
    password: "",
  });

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    const accepted = await login(form);

    if (accepted) {
      navigate("/jobs");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center text-gray-800 mb-6">
          Hệ thống tuyển dụng VIP PRO
        </h1>

        {/* Error */}
        {error instanceof Error && (
          <p className="text-red-600 text-center text-sm mb-4">
            {getAxiosErrorMessage(error)}
          </p>
        )}

        {/* FORM */}
        <form
          onSubmit={(e) => {
            void handleLogin(e);
          }}
          className="space-y-5"
        >
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
              autoComplete="email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="input"
            />
          </div>

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

          <button
            type="submit"
            disabled={loginLoading}
            className={`btn-login transition-all duration-200 cursor-pointer ${
              loginLoading ? "opacity-60 cursor-not-allowed scale-[0.98]" : ""
            }`}
          >
            {loginLoading ? <Loader size={20} /> : "Đăng nhập"}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <a
            href="/forgot-password"
            className="block mt-2 text-blue-700 hover:underline"
          >
            Quên mật khẩu?
          </a>

          <p className="text-gray-700 mt-3">
            Chưa có tài khoản?{" "}
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
