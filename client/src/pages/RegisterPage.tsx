// src/pages/RegisterPage.tsx
import { useState } from "react";
import { Loader } from "@/components";
import { useAppNavigate, useAuth } from "@/hooks";
import { PasswordInput } from "@/utils";

export default function RegisterPage() {
  const navigate = useAppNavigate();
  const { register: registerUser, registerLoading } = useAuth();

  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant" as "applicant" | "recruiter",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (form.password !== form.confirmPassword) {
      setMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    try {
      await registerUser({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setMsg(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch {
      // error đã có trong hook, không cần xử lý lại
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Tạo tài khoản</h1>

        {msg && <p className="text-center text-blue-700 mb-4">{msg}</p>}
        {/* Error */}

        <form
          onSubmit={(e) => {
            void handleSubmit(e);
          }}
          className="space-y-5"
        >
          {/* NAME */}
          <div>
            <label
              htmlFor="fullName"
              className="text-sm font-medium text-gray-600"
            >
              Họ tên
            </label>
            <input
              id="fullName"
              type="text"
              required
              className="input"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          </div>

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

          {/* PASSWORD */}
          <PasswordInput
            label="Mật khẩu"
            value={form.password}
            required
            onChange={(v) => setForm({ ...form, password: v })}
          />

          {/* CONFIRM PASSWORD */}
          <PasswordInput
            label="Xác nhận mật khẩu"
            value={form.password}
            required
            onChange={(v) => setForm({ ...form, password: v })}
          />

          {/* ROLE */}
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-600">
              Vai trò
            </label>
            <select
              id="role"
              className="input"
              value={form.role}
              onChange={(e) =>
                setForm({
                  ...form,
                  role: e.target.value as "applicant" | "recruiter",
                })
              }
            >
              <option value="applicant">Ứng viên</option>
              <option value="recruiter">Nhà tuyển dụng</option>
            </select>
          </div>

          {/* SUBMIT */}
          <button
            type="submit"
            disabled={registerLoading}
            className={`btn-login transition-all duration-200 cursor-pointer ${
              registerLoading
                ? "opacity-60 cursor-not-allowed scale-[0.98]"
                : ""
            }`}
          >
            {registerLoading ? <Loader size={20} /> : "Đăng ký"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm">
          Đã có tài khoản?{" "}
          <a
            href="/login"
            className="text-blue-700 font-semibold hover:underline"
          >
            Đăng nhập
          </a>
        </div>
      </div>
    </div>
  );
}
