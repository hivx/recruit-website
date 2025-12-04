import { useState } from "react";
import { Loader } from "@/components";
import { useAppNavigate } from "@/hooks";
import { register } from "@/services";
import { getAxiosErrorMessage } from "@/utils";

export function RegisterPage() {
  const navigate = useAppNavigate();
  const [msg, setMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "applicant" as "applicant" | "recruiter",
  });

  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setMsg("");

    if (form.password !== form.confirmPassword) {
      setMsg("Mật khẩu xác nhận không khớp!");
      return;
    }

    setLoading(true);

    try {
      await register({
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      });

      setMsg(
        "Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.",
      );

      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMsg(getAxiosErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-300 p-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8">
        <h1 className="text-2xl font-bold text-center mb-6">Tạo tài khoản</h1>

        {msg && <p className="text-center text-blue-700 mb-4">{msg}</p>}

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
              type="email"
              required
              className="input"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
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
              type="password"
              required
              className="input"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
            />
          </div>

          {/* CONFIRM PASSWORD */}
          <div>
            <label
              htmlFor="verify"
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

          {/* ROLE */}
          <div>
            <label htmlFor="role" className="text-sm font-medium text-gray-600">
              Vai trò
            </label>
            <select
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
          <button type="submit" disabled={loading} className="btn-login">
            {loading ? <Loader size={20} /> : "Đăng ký"}
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
