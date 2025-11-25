import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "@/services/authService";
import type { LoginPayload } from "@/types/auth";
import { getAxiosErrorMessage } from "@/utils";
import { Loader } from "@/components";

export default function LoginPage() {
  const navigate = useNavigate();

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
      localStorage.setItem("token", res.token);
      localStorage.setItem("user", JSON.stringify(res.user));

      navigate("/jobs");
    } catch (err) {
      setErrorMsg(getAxiosErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="backdrop-blur-xl bg-white/70 shadow-2xl border border-white/30 rounded-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Đăng nhập
        </h1>

        {errorMsg && (
          <p className="text-red-600 text-center text-sm mb-4">
            {errorMsg}
          </p>
        )}

        <form className="space-y-5" onSubmit={handleLogin}>
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block mb-1 font-semibold text-gray-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
            />
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="block mb-1 font-semibold text-gray-700"
            >
              Mật khẩu
            </label>
            <input
              id="password"
              type="password"
              required
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                         transition"
            />
          </div>

          {/* Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold
                       transition-all shadow-sm hover:shadow-lg disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? <Loader size={20} /> : "Đăng nhập"}
          </button>
        </form>

        {/* Register link */}
        <div className="text-sm text-center pt-4">
          Chưa có tài khoản?{" "}
          <a
            href="/register"
            className="text-blue-600 font-semibold hover:underline"
          >
            Đăng ký ngay
          </a>
        </div>
      </div>
    </div>
  );
}
