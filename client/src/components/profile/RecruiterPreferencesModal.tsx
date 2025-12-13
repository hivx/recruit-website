// src/components/profile/RecruiterPreferencesModal.tsx
import { Dialog, DialogPanel } from "@headlessui/react";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { z } from "zod";

import { Loader } from "@/components";
import { TagsInput, SkillNameInput } from "@/components/profile";
import { useUpdateRecruiterPreferences } from "@/hooks";
import type {
  RecruiterPreference,
  RecruiterPreferenceUpsertRequest,
} from "@/types";

/* =============================
   ZOD SCHEMA
============================= */
const PrefSchema = z.object({
  desired_location: z.string().min(1, "Địa điểm không được để trống"),

  desired_salary_avg: z
    .union([z.number().min(0, "Lương không thể âm"), z.null()])
    .refine((v) => v !== null, {
      message: "Hãy nhập Mức lương tuyển dụng",
    }),

  desired_tags: z.array(z.string()).min(1, "Hãy nhập ít nhất 1 tag"),

  required_skills: z
    .array(
      z.object({
        name: z.string().min(1, "Tên kỹ năng không được để trống"),
        years_required: z
          .number()
          .min(0, "Không thể âm")
          .max(30, "Tối đa 30 năm")
          .nullable()
          .optional(),
        must_have: z.boolean().optional(),
      }),
    )
    .optional(),
});

const MotionDialogPanel = motion.create(DialogPanel);

const EXPERIENCE_OPTIONS = [
  { value: null, label: "-----" },
  { value: 0, label: "Không yêu cầu kinh nghiệm" },
  { value: 1, label: "1 năm" },
  { value: 2, label: "2 năm" },
  { value: 3, label: "3 năm" },
  { value: 5, label: "5+ năm" },
  { value: 10, label: "10+ năm" },
];

export type PrefFormValues = z.infer<typeof PrefSchema>;

/* =============================
   COMPONENT
============================= */
interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
  readonly pref: RecruiterPreference | null;
}

export function RecruiterPreferencesModal({ open, onClose, pref }: Props) {
  const updatePref = useUpdateRecruiterPreferences();

  const {
    register,
    setValue,
    watch,
    reset,
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<PrefFormValues>({
    resolver: zodResolver(PrefSchema),
    defaultValues: {
      desired_location: "",
      desired_salary_avg: null,
      desired_tags: [],
      required_skills: [],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "required_skills",
  });

  /* Prefill khi edit */
  useEffect(() => {
    if (pref && open) {
      reset({
        desired_location: pref.desiredLocation ?? "",
        desired_salary_avg: pref.desiredSalaryAvg ?? null,
        desired_tags: pref.desiredTags.map((t) => t.name),
        required_skills: pref.requiredSkills.map((s) => ({
          name: s.name,
          years_required: s.yearsRequired,
          must_have: s.mustHave,
        })),
      });
    }
  }, [pref, open, reset]);

  /* Submit */
  const onSubmit = async (values: PrefFormValues) => {
    const payload: RecruiterPreferenceUpsertRequest = {
      ...values,
      required_skills: values.required_skills?.map((s) => ({
        name: s.name,
        years_required: s.years_required,
        must_have: s.must_have ?? false,
      })),
    };

    await updatePref.mutateAsync(payload);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* OVERLAY */}
      <div
        className="
          fixed inset-0
          bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-800/40
          backdrop-blur-sm
          animate-fade-in
        "
      />

      {/* MODAL */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <MotionDialogPanel
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="
            w-full max-w-2xl
            max-h-[80vh]
            rounded-2xl
            bg-white
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]
            relative
            border border-blue-100
            flex flex-col
          "
        >
          {/* LOADING */}
          {updatePref.isPending && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
              <Loader size={32} />
            </div>
          )}
          <div className="px-6 py-4 border-b border-blue-100">
            <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center text-sm">
                ⚙️
              </span>
              {pref ? "Cập nhật nhu cầu tuyển dụng" : "Tạo nhu cầu tuyển dụng"}
            </h2>
          </div>
          <form
            onSubmit={(e) => void handleSubmit(onSubmit)(e)}
            className="
              flex-1
              overflow-y-auto
              px-6 py-4
              space-y-6

              scrollbar-thin
              scrollbar-thumb-blue-300
              hover:scrollbar-thumb-blue-500
              scrollbar-track-transparent
            "
          >
            {/* LOCATION */}
            <div>
              <label
                htmlFor="reqLocation"
                className="block font-medium text-gray-700"
              >
                Địa điểm ưu tiên
              </label>
              <input
                id="reqLocation"
                {...register("desired_location")}
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                  transition
                "
              />
              {errors.desired_location && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.desired_location.message}
                </p>
              )}
            </div>

            {/* SALARY */}
            <div>
              <label
                htmlFor="reqSalary"
                className="block font-medium text-gray-700"
              >
                Mức lương tuyển dụng
              </label>
              <input
                id="reqSalary"
                min={0}
                step={1000000}
                type="number"
                {...register("desired_salary_avg", {
                  valueAsNumber: true,
                })}
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:outline-none
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                  transition
                "
              />
              {errors.desired_salary_avg && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.desired_salary_avg.message}
                </p>
              )}
            </div>

            {/* TAGS */}
            <div>
              <label
                htmlFor="desired_tags"
                className="block font-medium text-gray-700"
              >
                Ngành nghề/Lĩnh vực
              </label>

              <TagsInput
                id="desired_tags"
                name="desired_tags"
                values={watch("desired_tags")}
                onChange={(tags) =>
                  setValue("desired_tags", tags, { shouldValidate: true })
                }
                placeholder="VD: React, Node.js, AWS"
              />

              {errors.desired_tags && (
                <p className="text-red-600 text-sm mt-1">
                  {errors.desired_tags.message}
                </p>
              )}
            </div>

            {/* REQUIRED SKILLS */}
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label htmlFor="reqSKill" className="font-medium text-gray-700">
                  Kỹ năng cần thiết
                </label>
                <button
                  id="reqSKill"
                  type="button"
                  onClick={() =>
                    append({
                      name: "",
                      years_required: null,
                      must_have: false,
                    })
                  }
                  className="
                    inline-flex items-center gap-2
                    px-3 py-1.5 rounded-lg
                    bg-blue-600 text-white text-sm
                    hover:bg-blue-700 active:scale-95
                    transition cursor-pointer
                  "
                >
                  + Thêm kỹ năng
                </button>
              </div>

              {fields.length === 0 && (
                <p className="text-gray-500 italic">
                  Chưa có kỹ năng cần thiết
                </p>
              )}

              {fields.map((field, index) => (
                <motion.div
                  key={field.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="
                    flex items-center gap-3
                    p-3 rounded-xl border bg-white
                    hover:shadow-sm transition
                  "
                >
                  {/* Skill name */}
                  <SkillNameInput
                    id={`reqSkill.${index}`}
                    value={watch(`required_skills.${index}.name`) ?? ""}
                    onChange={(v) =>
                      setValue(`required_skills.${index}.name`, v, {
                        shouldValidate: true,
                      })
                    }
                  />

                  {/* Years */}
                  <select
                    {...register(`required_skills.${index}.years_required`, {
                      valueAsNumber: true,
                    })}
                    className="
                      w-40 rounded-lg border px-2 py-2
                      focus:ring-2 focus:ring-blue-400 outline-none
                    "
                  >
                    {EXPERIENCE_OPTIONS.map((opt) => (
                      <option key={String(opt.value)} value={opt.value ?? ""}>
                        {opt.label}
                      </option>
                    ))}
                  </select>

                  {/* Must have */}
                  <label className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                      type="checkbox"
                      {...register(`required_skills.${index}.must_have`)}
                      className="accent-blue-600"
                    />
                    Bắt buộc{" "}
                  </label>

                  {/* Remove */}
                  <button
                    type="button"
                    onClick={() => remove(index)}
                    className="
                      text-red-500 hover:text-red-700
                      transition cursor-pointer
                    "
                    title="Xóa kỹ năng"
                  >
                    ✕
                  </button>
                </motion.div>
              ))}
            </div>

            {/* ACTIONS */}
            <div className="px-6 py-4 border-t border-blue-100 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border cursor-pointer"
              >
                Hủy
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-blue-600 text-white font-semibold cursor-pointer"
              >
                Lưu thông tin
              </button>
            </div>
          </form>
        </MotionDialogPanel>
      </div>
    </Dialog>
  );
}
