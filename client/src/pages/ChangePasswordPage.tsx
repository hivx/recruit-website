// src/pages/ChangePasswordPage.tsx
import { Mail } from "lucide-react";
import { ChangePasswordForm } from "@/components";
import { useAuth } from "@/hooks";

export function ChangePasswordPage() {
  const { user } = useAuth();

  return (
    <div
      className="
        min-h-screen w-full
        bg-gradient-to-br from-blue-50 via-white to-blue-100
        px-4 py-10
      "
    >
      <div className="mx-auto max-w-xl">
        {/* Card */}
        <div className="rounded-2xl bg-white p-8 shadow-lg">
          {/* Title */}
          <h1 className="mb-6 text-2xl font-bold text-blue-700">
            Thay đổi mật khẩu đăng nhập
          </h1>

          {/* Email */}
          <div className="mb-6">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Email đăng nhập
            </label>

            <div className="relative">
              <Mail className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
              <input
                id="email"
                type="email"
                value={user?.email ?? ""}
                disabled
                autoComplete="off"
                className="
                  w-full rounded-lg border border-gray-300
                  bg-gray-100 px-10 py-2.5 text-sm text-gray-600
                  cursor-not-allowed
                "
              />
            </div>
          </div>

          {/* Divider */}
          <div className="mb-6 h-px w-full bg-gray-200" />

          {/* Form */}
          <ChangePasswordForm />
        </div>
      </div>
    </div>
  );
}
