// src/components/recruiter/CompanyForm.tsx
import type { CompanyFormProps } from "@/types";

/* ================= INPUT FIELD ================= */
interface InputProps {
  readonly label: string;
  readonly value: string;
  readonly type?: string;
  readonly disabled?: boolean;
  readonly onChange?: (v: string) => void;
}

function Input({
  label,
  value,
  type = "text",
  disabled,
  onChange,
}: InputProps) {
  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700">{label}</label>
      <input
        type={type}
        disabled={disabled}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 px-4 py-2 border rounded-xl disabled:bg-gray-100"
      />
    </div>
  );
}

/* ================= LOGO INPUT ================= */
interface LogoInputProps {
  readonly label: string;
  readonly file: File | null;
  readonly onChange: (file: File | null) => void;
}

function LogoInput({ label, file, onChange }: LogoInputProps) {
  const preview = file ? URL.createObjectURL(file) : null;

  return (
    <div className="flex flex-col">
      <label className="font-medium text-gray-700 mb-2">{label}</label>

      <div className="flex items-center gap-4">
        <div className="w-20 h-20 rounded-xl border bg-gray-100 overflow-hidden flex items-center justify-center">
          {preview ? (
            <img
              src={preview}
              alt="Logo preview"
              className="w-full h-full object-cover"
            />
          ) : (
            <span className="text-gray-400 text-xs">No image</span>
          )}
        </div>

        <input
          id="logo-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        <label
          htmlFor="logo-upload"
          className="px-4 py-2 rounded-xl border bg-white cursor-pointer hover:bg-gray-100"
        >
          Chọn ảnh
        </label>
      </div>
    </div>
  );
}

/* ================= FORM ================= */
export function CompanyForm({
  form,
  updateField,
  allowAllFields,
  editable = true,
}: Readonly<CompanyFormProps>) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Tên pháp lý"
        value={form.legal_name}
        disabled={!editable}
        onChange={(value) => updateField("legal_name", value)}
      />

      {allowAllFields && (
        <Input
          label="Mã đăng ký kinh doanh"
          value={form.registration_number}
          onChange={(value) => updateField("registration_number", value)}
        />
      )}

      {allowAllFields && (
        <Input
          label="Mã quốc gia"
          value={form.country_code}
          onChange={(value) => updateField("country_code", value)}
        />
      )}

      <Input
        label="Địa chỉ đăng ký"
        value={form.registered_address}
        disabled={!editable}
        onChange={(value) => updateField("registered_address", value)}
      />

      <Input
        label="Mã số thuế"
        value={form.tax_id}
        disabled={!editable}
        onChange={(value) => updateField("tax_id", value)}
      />

      <Input
        label="Ngày thành lập"
        type="date"
        value={form.incorporation_date}
        disabled={!editable}
        onChange={(value) => updateField("incorporation_date", value)}
      />

      <LogoInput
        label="Logo công ty"
        file={form.logo}
        onChange={(file) => updateField("logo", file)}
      />
    </div>
  );
}
