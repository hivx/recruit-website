// src/components/profile/UserProfileForm.tsx
/* ================= INPUT ================= */
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
        value={value}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.value)}
        className="mt-2 px-4 py-2 border rounded-xl disabled:bg-gray-100"
      />
    </div>
  );
}

/* ================= AVATAR ================= */
interface AvatarInputProps {
  readonly label: string;
  readonly file: File | null;
  readonly avatarUrl?: string;
  readonly onChange: (file: File | null) => void;
}

function AvatarInput({ label, file, avatarUrl, onChange }: AvatarInputProps) {
  const preview = file ? URL.createObjectURL(file) : avatarUrl;

  return (
    <div className="flex flex-col md:col-span-2">
      <span className="font-medium text-gray-700 mb-2">{label}</span>

      <div className="flex items-center gap-4">
        <div className="w-24 h-24 rounded-full border bg-gray-100 overflow-hidden">
          {preview ? (
            <img
              alt="avatar"
              src={preview}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">
              No avatar
            </div>
          )}
        </div>

        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => onChange(e.target.files?.[0] ?? null)}
        />

        <label
          htmlFor="avatar-upload"
          className="px-4 py-2 rounded-xl border bg-white cursor-pointer hover:bg-gray-100"
        >
          Chọn ảnh
        </label>
      </div>
    </div>
  );
}

/* ================= FORM ================= */
export interface UserFormState {
  name: string;
  email: string;
  avatar: File | null;
}

interface UserFormProps {
  readonly form: UserFormState;
  readonly avatarUrl?: string;
  readonly updateField: <K extends keyof UserFormState>(
    key: K,
    value: UserFormState[K],
  ) => void;
}

export function UserForm({ form, avatarUrl, updateField }: UserFormProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Input
        label="Họ và tên"
        value={form.name}
        onChange={(v) => updateField("name", v)}
      />

      <Input
        label="Email"
        type="email"
        value={form.email}
        onChange={(v) => updateField("email", v)}
      />

      <AvatarInput
        label="Ảnh đại diện"
        file={form.avatar}
        avatarUrl={avatarUrl}
        onChange={(file) => updateField("avatar", file)}
      />
    </div>
  );
}
