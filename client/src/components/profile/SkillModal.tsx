// src/components/profile/SkillModal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useAllSkills, useUpsertSkill, useDeleteSkill } from "@/hooks";
import { useSkillStore } from "@/stores";
import type { UserSkill } from "@/types";
import { skillFormSchema, type SkillFormValues } from "@/utils";

interface SkillModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly skill: UserSkill | null;
}

export function SkillModal({ open, onClose, skill }: SkillModalProps) {
  const isEdit = Boolean(skill);

  const upsertMutation = useUpsertSkill();
  const deleteMutation = useDeleteSkill();

  /** UI state: điều khiển dropdown */
  const [active, setActive] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    defaultValues: {
      name: "",
      level: 1,
      years: 0,
      note: "",
    },
  });

  /** Reset form khi mở modal */
  useEffect(() => {
    if (skill) {
      reset({
        name: skill.name,
        level: skill.level,
        years: skill.years,
        note: skill.note ?? "",
      });
    } else {
      reset({
        name: "",
        level: 1,
        years: 0,
        note: "",
      });
    }
  }, [skill, reset]);

  const nameWatch = watch("name");

  const { data: skillOptions = [] } = useAllSkills(nameWatch || undefined);
  const setAllSkills = useSkillStore((s) => s.setAllSkills);

  useEffect(() => {
    if (skillOptions) {
      setAllSkills(skillOptions);
    }
  }, [skillOptions, setAllSkills]);

  // =============================
  // DROPDOWN LOGIC (RÕ NGHĨA)
  // =============================
  const hasKeyword = (nameWatch?.length ?? 0) > 0;
  const hasOptions = skillOptions.length > 0;
  const nameChanged = !isEdit || nameWatch !== skill?.name;

  const showDropdown =
    active && hasOptions && nameChanged && (hasKeyword || !isEdit);

  const isLoading = upsertMutation.isPending || deleteMutation.isPending;

  // =============================
  // SUBMIT
  // =============================
  const onSubmit: SubmitHandler<SkillFormValues> = async (values) => {
    try {
      const changedName = isEdit && skill && values.name !== skill.name;

      if (changedName && skill) {
        await deleteMutation.mutateAsync(skill.id);
      }

      await upsertMutation.mutateAsync(values);

      toast.success(
        isEdit ? "Cập nhật kỹ năng thành công!" : "Đã thêm kỹ năng mới!",
      );

      onClose();
    } catch {
      toast.error("Không thể lưu kỹ năng. Vui lòng thử lại!");
    }
  };

  if (!open) {
    return null;
  }

  // =============================
  // UI
  // =============================
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
    >
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/60 rounded-xl">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="
          relative w-full max-w-lg rounded-2xl bg-white
          p-6 shadow-2xl border border-gray-100
        "
      >
        {/* HEADER */}
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold">
            {isEdit ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
          </h3>

          <button
            type="button"
            aria-label="Đóng"
            onClick={onClose}
            className="rounded-full p-2 hover:bg-gray-100 transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          onSubmit={(e) => void handleSubmit(onSubmit)(e)}
          className="space-y-4"
        >
          {/* SKILL NAME + DROPDOWN */}
          <div className="relative">
            <label htmlFor="skillName" className="text-sm font-medium">
              Tên kỹ năng
            </label>

            <input
              id="skillName"
              {...register("name")}
              autoComplete="off"
              placeholder="Nhập tên kỹ năng…"
              onFocus={() => setActive(true)}
              onBlur={(e) => {
                // nếu blur vì click vào dropdown thì KHÔNG đóng
                if (
                  e.relatedTarget &&
                  e.currentTarget.parentElement?.contains(
                    e.relatedTarget as Node,
                  )
                ) {
                  return;
                }
                setActive(false);
              }}
              className="
                mt-1 w-full rounded-lg border px-3 py-2
                transition outline-none
                focus:ring-2 focus:ring-blue-400 focus:border-blue-400
              "
            />

            {errors.name && (
              <p className="mt-1 text-xs text-red-500">{errors.name.message}</p>
            )}

            {showDropdown && (
              <div
                className="
                  absolute z-20 mt-1 w-full
                  rounded-lg border bg-white shadow
                  max-h-40 overflow-auto animate-fade-in
                "
              >
                {skillOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    tabIndex={0}
                    className="
                      w-full px-3 py-2 text-left text-sm
                      hover:bg-gray-100 focus:bg-gray-100
                    "
                    onClick={() => {
                      setValue("name", opt.name, {
                        shouldValidate: true,
                      });
                      setActive(false);
                    }}
                  >
                    {opt.name}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* LEVEL */}
          <div>
            <label htmlFor="level" className="text-sm font-medium">
              Mức độ (1–5)
            </label>
            <select
              id="level"
              {...register("level", { valueAsNumber: true })}
              className="
                mt-1 w-full rounded-lg border px-3 py-2
                focus:ring-2 focus:ring-blue-400 outline-none
              "
            >
              {[1, 2, 3, 4, 5].map((lv) => (
                <option key={lv} value={lv}>
                  Level {lv}
                </option>
              ))}
            </select>
          </div>

          {/* YEARS */}
          <div>
            <label htmlFor="years" className="text-sm font-medium">
              Số năm kinh nghiệm
            </label>
            <input
              id="years"
              type="number"
              min={0}
              {...register("years", { valueAsNumber: true })}
              className="
                mt-1 w-full rounded-lg border px-3 py-2
                focus:ring-2 focus:ring-blue-400 outline-none
              "
            />
          </div>

          {/* NOTE */}
          <div>
            <label htmlFor="note" className="text-sm font-medium">
              Ghi chú
            </label>
            <textarea
              id="note"
              rows={3}
              {...register("note")}
              className="
                mt-1 w-full rounded-lg border px-3 py-2
                focus:ring-2 focus:ring-blue-400 outline-none
              "
            />
          </div>

          {/* SUBMIT */}
          <motion.button
            type="submit"
            disabled={isLoading}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            className="
              w-full rounded-lg bg-blue-600 py-2 font-medium text-white
              hover:bg-blue-700 transition
              disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer
            "
          >
            {isEdit ? "Cập nhật kỹ năng" : "Thêm kỹ năng"}
          </motion.button>
        </form>
      </motion.div>
    </motion.div>
  );
}
