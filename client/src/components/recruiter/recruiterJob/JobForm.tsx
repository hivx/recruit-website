// src/components/recruiter/recruiterJob/JobForm.tsx
import { useMemo, useState } from "react";
import { SkillNameInput } from "@/components/profile";
import type { JobCreatePayload, JobDetail, JobRequiredSkill } from "@/types";
import { isNonEmptyString } from "@/utils";

type Mode = "create" | "edit";

export interface JobFormProps {
  readonly mode: Mode;
  readonly initialData?: JobDetail;
  readonly loading?: boolean;
  readonly onSubmit: (data: JobCreatePayload) => void;
  readonly onCancel?: () => void;
}

export function JobForm({
  mode,
  initialData,
  loading = false,
  onSubmit,
  onCancel,
}: JobFormProps) {
  /* ======================================================
     1. BASIC FIELDS
     ====================================================== */
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? "",
  );
  const [requirements, setRequirements] = useState(
    initialData?.requirements ?? "",
  );

  const [salaryMin, setSalaryMin] = useState<number | null>(
    typeof initialData?.salaryMin === "number" ? initialData.salaryMin : null,
  );
  const [salaryMax, setSalaryMax] = useState<number | null>(
    typeof initialData?.salaryMax === "number" ? initialData.salaryMax : null,
  );

  /* ======================================================
     2. TAGS
     ====================================================== */
  const [tags, setTags] = useState<string[]>(() => {
    return (
      initialData?.tags?.map((t) => t.tag?.name).filter(isNonEmptyString) ?? []
    );
  });
  const tagsText = useMemo(() => tags.join(", "), [tags]);

  /* ======================================================
     3. REQUIRED SKILLS
     ====================================================== */
  const [requiredSkills, setRequiredSkills] = useState<JobRequiredSkill[]>(
    () => {
      return (
        initialData?.requiredSkills?.map((s) => ({
          name: s.name,
          levelRequired: s.levelRequired ?? null,
          yearsRequired: s.yearsRequired ?? null,
          mustHave: Boolean(s.mustHave),
        })) ?? []
      );
    },
  );

  // Draft skill để nhập
  const [skillDraft, setSkillDraft] = useState<{
    name: string;
    levelRequired: number | null;
    yearsRequired: number | null;
    mustHave: boolean;
  }>({
    name: "",
    levelRequired: null,
    yearsRequired: null,
    mustHave: true,
  });
  const baseSubmitLabel = mode === "create" ? "Tạo job" : "Cập nhật job";
  const submitLabel = loading ? "Đang lưu..." : baseSubmitLabel;

  function handleAddSkill() {
    const name = skillDraft.name.trim();
    if (!name) {
      return;
    }

    setRequiredSkills((prev) => [
      ...prev,
      {
        name: name,
        levelRequired: skillDraft.levelRequired,
        yearsRequired: skillDraft.yearsRequired,
        mustHave: skillDraft.mustHave,
      },
    ]);

    setSkillDraft({
      name: "",
      levelRequired: null,
      yearsRequired: null,
      mustHave: true,
    });
  }

  function handleRemoveSkill(index: number) {
    setRequiredSkills((prev) => prev.filter((_, i) => i !== index));
  }

  /* ======================================================
     4. SUBMIT
     ====================================================== */
  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    const payload: JobCreatePayload = {
      title: title.trim(),
      location: location.trim() || null,
      description: description.trim() || null,
      requirements: requirements.trim() || null,
      salaryMin,
      salaryMax,
      tags: tags.filter((t) => t.length > 0),

      requiredSkills: requiredSkills.map((s) => ({
        name: s.name,
        levelRequired: s.levelRequired ?? null,
        yearsRequired: s.yearsRequired ?? null,
        mustHave: Boolean(s.mustHave),
      })),
    };

    onSubmit(payload);
  }

  /* ======================================================
     5. RENDER
     ====================================================== */
  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-2xl shadow-lg p-6 md:p-8 space-y-6 border border-gray-100"
    >
      {/* ================= HEADER ================= */}
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-xl font-semibold text-gray-900">
          {mode === "create" ? "Thêm tin tuyển dụng" : "Sửa tin tuyển dụng"}
        </h2>

        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="
            px-3 py-2 rounded-lg
            bg-gray-100 text-gray-700
            hover:bg-gray-200 transition cursor-pointer
          "
          >
            Hủy
          </button>
        )}
      </div>

      {/* ================= TITLE ================= */}
      <div className="space-y-2">
        <label htmlFor="title" className="text-sm font-medium text-gray-700">
          Tiêu đề
        </label>
        <input
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
          className="
          w-full border rounded-xl px-4 py-2.5
          focus:ring-2 focus:ring-blue-400
          focus:border-blue-400 outline-none
        "
        />
      </div>

      {/* ================= LOCATION + SALARY ================= */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* LOCATION */}
        <div className="space-y-2">
          <label
            htmlFor="location"
            className="text-sm font-medium text-gray-700"
          >
            Địa điểm
          </label>
          <input
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="
            w-full border rounded-xl px-4 py-2.5
            focus:ring-2 focus:ring-blue-400 outline-none
          "
            placeholder="Địa điểm"
          />
        </div>

        {/* SALARY */}
        <div className="space-y-2">
          <label
            htmlFor="salaryMin"
            className="text-sm font-medium text-gray-700"
          >
            Mức lương
          </label>

          <div className="grid grid-cols-2 gap-3">
            <input
              id="salaryMin"
              type="number"
              value={salaryMin ?? ""}
              min={0}
              step={1000000}
              onChange={(e) =>
                setSalaryMin(e.target.value ? Number(e.target.value) : null)
              }
              className="
              border rounded-xl px-4 py-2.5
              focus:ring-2 focus:ring-blue-400 outline-none
            "
              placeholder="Từ"
            />
            <input
              id="salaryMax"
              type="number"
              value={salaryMax ?? ""}
              min={0}
              step={1000000}
              onChange={(e) =>
                setSalaryMax(e.target.value ? Number(e.target.value) : null)
              }
              className="
              border rounded-xl px-4 py-2.5
              focus:ring-2 focus:ring-blue-400 outline-none
            "
              placeholder="Đến"
            />
          </div>
        </div>
      </div>

      {/* ================= DESCRIPTION ================= */}
      <div className="space-y-2">
        <label
          htmlFor="description"
          className="text-sm font-medium text-gray-700"
        >
          Mô tả công việc
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="
          w-full border rounded-xl px-4 py-2.5 min-h-[100px]
          focus:ring-2 focus:ring-blue-400 outline-none
        "
        />
      </div>

      {/* ================= REQUIREMENTS ================= */}
      <div className="space-y-2">
        <label
          htmlFor="requirements"
          className="text-sm font-medium text-gray-700"
        >
          Yêu cầu
        </label>
        <textarea
          id="requirements"
          value={requirements}
          onChange={(e) => setRequirements(e.target.value)}
          className="
          w-full border rounded-xl px-4 py-2.5 min-h-[80px]
          focus:ring-2 focus:ring-blue-400 outline-none
        "
        />
      </div>

      {/* ================= TAGS ================= */}
      <div className="space-y-2">
        <label htmlFor="tags" className="text-sm font-medium text-gray-700">
          Tags
        </label>
        <input
          id="tags"
          value={tagsText}
          onChange={(e) =>
            setTags(
              e.target.value
                .split(",")
                .map((x) => x.trim())
                .filter(Boolean),
            )
          }
          className="
          w-full border rounded-xl px-4 py-2.5
          focus:ring-2 focus:ring-blue-400 outline-none
        "
          placeholder="Node.js, React, PostgreSQL"
        />
      </div>

      {/* ================= REQUIRED SKILLS ================= */}
      <div className="space-y-3">
        <label htmlFor="reqSkill" className="text-sm font-medium text-gray-700">
          Required skills
        </label>

        {/* INPUT ROW */}
        <div
          className="
          flex flex-wrap gap-2 items-end
          p-3 rounded-xl border bg-gray-50
          focus-within:ring-2 focus-within:ring-blue-200
        "
        >
          <div className="flex-1 min-w-[200px]">
            <SkillNameInput
              id="reqSkill"
              value={skillDraft.name}
              onChange={(name) => setSkillDraft((s) => ({ ...s, name }))}
              placeholder="Nhập tên skill…"
            />
          </div>

          <input
            id="reqSkillLevel"
            type="number"
            value={skillDraft.levelRequired ?? ""}
            onChange={(e) =>
              setSkillDraft((s) => ({
                ...s,
                levelRequired: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="w-20 border rounded-lg px-2 py-2 text-sm"
            placeholder="Lv"
          />

          <input
            id="reqSkillYears"
            type="number"
            value={skillDraft.yearsRequired ?? ""}
            onChange={(e) =>
              setSkillDraft((s) => ({
                ...s,
                yearsRequired: e.target.value ? Number(e.target.value) : null,
              }))
            }
            className="w-24 border rounded-lg px-2 py-2 text-sm"
            placeholder="Years"
          />

          <label
            htmlFor="reqSkillMustHave"
            className="flex items-center gap-1 text-sm"
          >
            <input
              id="reqSkillMustHave"
              type="checkbox"
              checked={skillDraft.mustHave}
              onChange={(e) =>
                setSkillDraft((s) => ({ ...s, mustHave: e.target.checked }))
              }
            />
            Must-have{" "}
          </label>

          <button
            type="button"
            onClick={handleAddSkill}
            className="
            px-3 py-2 rounded-lg
            bg-blue-600 text-white text-sm
            hover:bg-blue-700 transition cursor-pointer
          "
          >
            + Thêm
          </button>
        </div>

        {/* SKILL LIST */}
        {requiredSkills.length === 0 ? (
          <p className="text-sm text-gray-500 italic">Chưa có skill nào.</p>
        ) : (
          <div className="space-y-2">
            {requiredSkills.map((s, idx) => (
              <div
                key={s.name}
                className="
                flex items-center gap-3
                border rounded-xl px-3 py-2
                hover:border-blue-300 transition
              "
              >
                <strong>{s.name}</strong>
                <span className="text-xs">Lv: {s.levelRequired ?? "N/A"}</span>
                <span className="text-xs">
                  Years: {s.yearsRequired ?? "N/A"}
                </span>
                <span className="text-xs">{s.mustHave ? "Must-have" : ""}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(idx)}
                  className="ml-auto text-xs text-red-600 hover:underline cursor-pointer"
                >
                  Xóa
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ================= SUBMIT ================= */}
      <div className="flex justify-end pt-4">
        <button
          type="submit"
          disabled={loading}
          className="
          px-5 py-2.5 rounded-xl
          bg-blue-600 text-white font-medium
          hover:bg-blue-700 disabled:opacity-60 cursor-pointer
        "
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
