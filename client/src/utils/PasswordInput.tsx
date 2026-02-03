// src/utils/PasswordInput.tsx
import { Eye, EyeOff } from "lucide-react";
import { useState } from "react";

interface PasswordInputProps {
  readonly id?: string;
  readonly label?: string;
  readonly value: string;
  readonly onChange: (value: string) => void;
  readonly required?: boolean;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function PasswordInput({
  id = "password",
  label = "Mật khẩu",
  value,
  onChange,
  required = false,
  placeholder,
  disabled = false,
}: PasswordInputProps) {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      {label && (
        <label htmlFor={id} className="text-sm font-medium text-gray-600">
          {label}
        </label>
      )}

      <input
        id={id}
        type={show ? "text" : "password"}
        value={value}
        required={required}
        disabled={disabled}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        className="input pr-10"
      />

      <button
        type="button"
        onClick={() => setShow((v) => !v)}
        className="
          absolute right-3 top-[38px]
          text-gray-400 hover:text-gray-600
          disabled:opacity-50
        "
        tabIndex={-1}
        aria-label={show ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
