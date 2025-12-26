// src/components/admin/AdminUserForm.tsx
import {
  Mail,
  User as UserIcon,
  CheckCircle2,
  X,
  Save,
  Lock,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import type {
  User,
  UserRole,
  AdminCreateUserPayload,
  AdminUpdateUserPayload,
} from "@/types";

/* ======================================================
 * PROPS (DISCRIMINATED UNION)
 * ====================================================== */

type AdminUserFormCreateProps = {
  mode: "create";
  loading?: boolean;
  onSubmit: (payload: AdminCreateUserPayload) => void;
  onCancel?: () => void;
};

type AdminUserFormEditProps = {
  mode: "edit";
  initialData: User;
  loading?: boolean;
  onSubmit: (payload: AdminUpdateUserPayload) => void;
  onCancel?: () => void;
};

export type AdminUserFormProps =
  | AdminUserFormCreateProps
  | AdminUserFormEditProps;

/* ======================================================
 * CONSTANTS
 * ====================================================== */

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
  { value: "admin", label: "Admin" },
  { value: "recruiter", label: "Recruiter" },
  { value: "applicant", label: "Applicant" },
];

/* ======================================================
 * COMPONENT
 * ====================================================== */

export function AdminUserForm(props: AdminUserFormProps) {
  const { mode, loading = false, onSubmit, onCancel } = props;
  const initialData = mode === "edit" ? props.initialData : undefined;

  /* ===================== STATE ===================== */
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // create only
  const [role, setRole] = useState<UserRole>("applicant");
  const [isVerified, setIsVerified] = useState(true);

  /* ===================== INIT (EDIT) ===================== */
  useEffect(() => {
    if (!initialData) {
      return;
    }

    setName(initialData.name ?? "");
    setEmail(initialData.email);
    setRole(initialData.role);
    setIsVerified(initialData.isVerified);
    setPassword("");
  }, [initialData]);

  /* ===================== LABEL ===================== */
  const title = mode === "create" ? "Tạo người dùng" : "Cập nhật người dùng";
  const baseSubmitLabel = mode === "create" ? "Tạo mới" : "Cập nhật";
  const submitLabel = loading ? "Đang lưu..." : baseSubmitLabel;

  /* ===================== VALIDATION ===================== */
  const canSubmit = useMemo(() => {
    if (!name.trim()) {
      return false;
    }

    if (mode === "create") {
      if (!email.trim()) {
        return false;
      }
      if (password.length < 6) {
        return false;
      }
    }

    return true;
  }, [name, email, password, mode]);

  /* ===================== SUBMIT ===================== */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) {
      return;
    }

    if (mode === "create") {
      onSubmit({
        name: name.trim(),
        email: email.trim(),
        password,
        role,
        isVerified,
      });
      return;
    }

    const emailChanged = email.trim() !== initialData?.email;

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      role,
      isVerified: emailChanged ? false : isVerified,
    });
  }

  /* ===================== RENDER ===================== */
  return (
    <form
      onSubmit={handleSubmit}
      className="
        relative rounded-2xl p-6 md:p-7 space-y-5
        bg-gradient-to-br from-blue-50 via-white to-blue-100
        border border-blue-100 shadow-xl
      "
    >
      <div className="absolute inset-0 -z-10 rounded-2xl bg-blue-200/30 blur-2xl" />

      {/* HEADER */}
      <div className="flex justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-100 text-blue-600">
            <UserIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600">
              Quản lý role, email, mật khẩu và trạng thái kích hoạt
            </p>
          </div>
        </div>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-3 py-2 rounded-xl bg-white border hover:bg-gray-50"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* NAME */}
      <InputField
        id="name"
        icon={<UserIcon className="w-4 h-4" />}
        label="Tên"
        value={name}
        onChange={setName}
        autoComplete="off"
        required
      />

      {/* EMAIL */}
      <InputField
        id="email"
        icon={<Mail className="w-4 h-4" />}
        label="Email"
        value={email}
        onChange={setEmail}
        autoComplete="off"
        required={mode === "create"}
      />

      {/* PASSWORD (CREATE ONLY) */}
      {mode === "create" && (
        <InputField
          id="password"
          icon={<Lock className="w-4 h-4" />}
          label="Mật khẩu ban đầu"
          type="password"
          value={password}
          onChange={setPassword}
          required
        />
      )}

      {/* ROLE */}
      <div>
        <label htmlFor="role" className="text-sm font-medium">
          Vai trò
        </label>
        <select
          id="role"
          value={role}
          onChange={(e) => setRole(e.target.value as UserRole)}
          className="w-full mt-1 px-4 py-2 rounded-xl border"
        >
          {ROLE_OPTIONS.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* VERIFIED */}
      <button
        type="button"
        onClick={() => setIsVerified((v) => !v)}
        className={`w-full px-4 py-2 rounded-xl border transition ${
          isVerified
            ? "bg-blue-600 text-white border-blue-600"
            : "bg-white text-gray-700 border-gray-200"
        }`}
      >
        <CheckCircle2 className="inline w-4 h-4 mr-2" />
        {isVerified ? "Đang kích hoạt" : "Đang vô hiệu hóa"}
      </button>

      {/* SUBMIT */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border"
          >
            Hủy
          </button>
        )}
        <button
          type="submit"
          disabled={loading || !canSubmit}
          className="px-5 py-2 rounded-xl bg-blue-600 text-white"
        >
          <Save className="w-4 h-4 inline mr-1" />
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

/* ======================================================
 * SMALL INPUT COMPONENT (OPTIONAL)
 * ====================================================== */

function InputField({
  id,
  label,
  icon,
  value,
  onChange,
  autoComplete,
  required,
  type = "text",
}: {
  readonly id?: string;
  readonly label: string;
  readonly icon: React.ReactNode;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly autoComplete?: string;
  readonly required?: boolean;
  readonly type?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="text-sm font-medium">
        {label}
      </label>
      <div className="relative mt-1">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
        <input
          id={id}
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoComplete={autoComplete}
          required={required}
          className="w-full pl-10 pr-4 py-2 rounded-xl border"
        />
      </div>
    </div>
  );
}
