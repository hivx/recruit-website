// src/components/profile/SkillNameInput.tsx
import { useEffect, useRef, useState } from "react";
import { useSkillStore } from "@/stores";

interface SkillNameInputProps {
  readonly id: string;
  readonly value: string;
  readonly onChange: (v: string) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function SkillNameInput({
  id,
  value,
  onChange,
  placeholder,
  disabled,
}: SkillNameInputProps) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  const allSkills = useSkillStore((s) => s.allSkills);

  /* đóng dropdown khi click ra ngoài */
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        wrapperRef.current &&
        !wrapperRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  const filtered =
    value.trim().length === 0
      ? allSkills
      : allSkills.filter((s) =>
          s.name.toLowerCase().includes(value.toLowerCase()),
        );

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        id={id}
        type="text"
        value={value}
        disabled={disabled}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        placeholder={placeholder ?? "Nhập hoặc chọn kỹ năng"}
        className="
          w-full rounded-lg border px-3 py-2
          focus:ring-2 focus:ring-blue-400 outline-none
          disabled:bg-gray-100
        "
      />

      {open && filtered.length > 0 && !disabled && (
        <div
          className="
            absolute z-30 mt-1 w-full max-h-40
            overflow-auto rounded-lg border bg-white shadow
          "
        >
          {filtered.map((skill) => (
            <button
              key={skill.id}
              type="button"
              className="
                w-full px-3 py-2 text-left text-sm
                hover:bg-gray-100
              "
              onClick={() => {
                onChange(skill.name);
                setOpen(false);
              }}
            >
              {skill.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
