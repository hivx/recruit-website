// src/components/profile/SkillModal.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { toast } from "sonner";
import { useAllSkills, useUpsertSkill, useDeleteSkill } from "@/hooks";
import type { UserSkill } from "@/types";
import { skillFormSchema, type SkillFormValues } from "@/utils";

interface SkillModalProps {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly skill: UserSkill | null;
}

export function SkillModal({ open, onClose, skill }: SkillModalProps) {
  const isEdit = !!skill;

  const upsertMutation = useUpsertSkill();
  const deleteMutation = useDeleteSkill();

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
      name: skill?.name ?? "",
      level: skill?.level ?? 1,
      years: skill?.years ?? 0,
      note: skill?.note ?? "",
    },
  });
  // Khi skill thay đổi (mở modal sửa skill khác), reset form
  useEffect(() => {
    if (skill) {
      reset({
        name: skill.name,
        level: skill.level,
        years: skill.years,
        note: skill.note ?? "",
      });
    } else {
      // mode thêm mới → reset form rỗng
      reset({
        name: "",
        level: 1,
        years: 0,
        note: "",
      });
    }
  }, [skill, reset]);

  const nameWatch = watch("name");

  const { data: skillOptions } = useAllSkills(nameWatch || undefined);

  // --------------------------
  // SUBMIT HANDLER
  // --------------------------
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

  const showDropdown =
    (nameWatch?.length ?? 0) > 0 &&
    skillOptions &&
    skillOptions.length > 0 &&
    // Nếu đang edit và tên chưa đổi -> Ko gợi ý
    (!isEdit || nameWatch !== skill?.name);

  const isLoading = upsertMutation.isPending || deleteMutation.isPending;

  // --------------------------
  // UI
  // --------------------------
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm"
    >
      {/* Loading Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-50 rounded-xl">
          <div className="animate-spin h-8 w-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="
          bg-white w-full max-w-lg rounded-2xl p-6 shadow-2xl relative
          border border-gray-100
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">
            {isEdit ? "Chỉnh sửa kỹ năng" : "Thêm kỹ năng mới"}
          </h3>

          <button
            type="button"
            aria-label="Đóng"
            className="
              p-2 rounded-full hover:bg-gray-100 transition cursor-pointer
              active:scale-95
            "
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        {/* FORM */}
        <form
          className="space-y-4"
          onSubmit={(e) => {
            void handleSubmit(onSubmit)(e);
          }}
        >
          {/* NAME FIELD */}
          <div>
            <label htmlFor="skillName" className="text-sm font-medium">
              Tên kỹ năng
            </label>

            <input
              id="skillName"
              {...register("name")}
              className="
                w-full border rounded-lg px-3 py-2 mt-1 transition
                focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none
              "
              placeholder="Nhập tên kỹ năng…"
              autoComplete="off"
            />

            {errors.name && (
              <p className="text-xs text-red-500 mt-1">{errors.name.message}</p>
            )}

            {/* DROPDOWN */}
            {showDropdown && (
              <div className="mt-1 border rounded-lg bg-white max-h-40 overflow-auto shadow animate-fade-in">
                {skillOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className="
                      w-full text-left px-3 py-2 text-sm
                      hover:bg-gray-100 focus:bg-gray-100 transition
                    "
                    onClick={() =>
                      setValue("name", opt.name, { shouldValidate: true })
                    }
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
                w-full border rounded-lg px-3 py-2 mt-1 transition
                focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none
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
                w-full border rounded-lg px-3 py-2 mt-1 transition
                focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none
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
              {...register("note")}
              rows={3}
              className="
                w-full border rounded-lg px-3 py-2 mt-1 transition
                focus:ring-2 focus:ring-blue-400 focus:border-blue-400 outline-none
              "
            />
          </div>

          {/* SUBMIT BUTTON */}
          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.96 }}
            disabled={isLoading}
            className="
              w-full bg-blue-600 text-white py-2 rounded-lg font-medium
              hover:bg-blue-700 active:scale-95 transition
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
