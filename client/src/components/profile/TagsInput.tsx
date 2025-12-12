// src/components/profile/TagsInput.tsx
import { useEffect, useRef, useState } from "react";
import { useTagStore } from "@/stores";

interface TagsInputProps {
  readonly id: string;
  readonly name?: string;
  readonly values: string[];
  readonly onChange: (tags: string[]) => void;
  readonly placeholder?: string;
  readonly disabled?: boolean;
}

export function TagsInput({
  id,
  name,
  values,
  onChange,
  placeholder,
  disabled,
}: TagsInputProps) {
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement | null>(null);

  // =============================
  // TAG STORE
  // =============================
  const tags = useTagStore((s) => s.tags);
  const fetchTags = useTagStore((s) => s.fetchTags);

  useEffect(() => {
    void fetchTags();
  }, [fetchTags]);

  // =============================
  // CLICK OUTSIDE
  // =============================
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

  // =============================
  // TAG HANDLERS
  // =============================
  const addTag = (tag: string) => {
    const trimmed = tag.trim();
    if (!trimmed) {
      return;
    }
    if (values.includes(trimmed)) {
      return;
    }

    onChange([...values, trimmed]);
    setInput("");
  };

  const removeTag = (tag: string) => {
    onChange(values.filter((t) => t !== tag));
  };

  const toggleTag = (tag: string) => {
    if (values.includes(tag)) {
      removeTag(tag);
    } else {
      onChange([...values, tag]);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag(input);
    }
  };

  // =============================
  // UI
  // =============================
  return (
    <div ref={wrapperRef} className="relative">
      {/* INPUT WRAPPER */}
      <div
        ref={wrapperRef}
        role="combobox"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => !disabled && setOpen(true)}
        className="
          w-full min-h-[46px] px-3 py-2 border rounded-xl bg-white
          flex flex-wrap gap-2 items-center text-left
          focus:outline-none focus:ring-2 focus:ring-blue-500
          transition-all
          disabled:opacity-60 disabled:cursor-not-allowed
        "
      >
        {/* TAG CHIPS */}
        {values.map((tag) => (
          <span
            key={tag}
            className="
        flex items-center gap-2 px-3 py-1 rounded-full
        bg-blue-100 text-blue-700 text-sm
      "
          >
            {tag}

            <button
              type="button"
              aria-label={`Xóa tag ${tag}`}
              onClick={(e) => {
                e.stopPropagation();
                removeTag(tag);
              }}
              className="
          text-blue-600 hover:text-red-600
          transition-colors text-base leading-none
        "
            >
              ×
            </button>
          </span>
        ))}

        {/* INPUT */}
        <input
          id={id}
          name={name}
          type="text"
          disabled={disabled}
          className="
      flex-1 min-w-[120px]
      border-none outline-none py-1 text-sm
      disabled:bg-transparent disabled:cursor-not-allowed
    "
          placeholder={placeholder ?? "Nhập tag và nhấn Enter"}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          onClick={(e) => e.stopPropagation()}
        />
      </div>

      {/* DROPDOWN TAG LIST */}
      {open && !disabled && (
        <div
          className="
            absolute z-20 mt-2 w-full bg-white rounded-xl shadow-lg
            border border-gray-200 max-h-60 overflow-y-auto
            animate-dropdown
          "
        >
          {tags.length === 0 && (
            <p className="text-gray-500 text-sm px-3 py-2">Đang tải tag…</p>
          )}

          {tags.map((tag) => {
            const active = values.includes(tag.name);

            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => toggleTag(tag.name)}
                className={`
                  w-full flex items-center gap-2 px-3 py-2 text-sm
                  transition rounded-md
                  ${
                    active
                      ? "bg-blue-100 text-blue-700 font-medium"
                      : "hover:bg-gray-100 text-gray-700"
                  }
                `}
              >
                <input
                  type="checkbox"
                  checked={active}
                  readOnly
                  className="w-4 h-4"
                />
                {tag.name}
              </button>
            );
          })}
        </div>
      )}

      {/* Hidden input cho form / autofill */}
      {name && <input type="hidden" name={name} value={values.join(",")} />}
    </div>
  );
}
