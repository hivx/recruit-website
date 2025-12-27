// src/components/profile/CareerPreferencesModal.tsx
import { Dialog, DialogPanel } from "@headlessui/react";
import { motion } from "framer-motion";
import { X, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { Loader } from "@/components";
import { TagsInput } from "@/components/profile";
import { useCareerPreference, useUpsertCareerPreference } from "@/hooks";
import type { CareerPreferenceUpsert } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

const MotionDialogPanel = motion.create(DialogPanel);

interface Props {
  readonly open: boolean;
  readonly onClose: () => void;
}

interface FormState {
  desiredTitle: string;
  desiredCompany: string;
  desiredLocation: string;
  desiredSalary: number | null;
  tags: string[];
}

const EMPTY_FORM: FormState = {
  desiredTitle: "",
  desiredCompany: "",
  desiredLocation: "",
  desiredSalary: null,
  tags: [],
};

export function CareerPreferencesModal({ open, onClose }: Props) {
  const { data: pref } = useCareerPreference();
  const upsertPref = useUpsertCareerPreference();

  const [form, setForm] = useState<FormState>(EMPTY_FORM);

  /* =============================
     PREFILL
  ============================= */
  useEffect(() => {
    if (!open) {
      return;
    }

    if (!pref) {
      setForm(EMPTY_FORM);
      return;
    }

    setForm({
      desiredTitle: pref.desiredTitle ?? "",
      desiredCompany: pref.desiredCompany ?? "",
      desiredLocation: pref.desiredLocation ?? "",
      desiredSalary: pref.desiredSalary ?? null,
      tags: pref.tags.map((t) => t.name),
    });
  }, [open, pref]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  /* =============================
     SUBMIT
  ============================= */
  const handleSubmit = async () => {
    try {
      const payload: CareerPreferenceUpsert = {};

      if (form.desiredTitle.trim()) {
        payload.desiredTitle = form.desiredTitle.trim();
      }
      if (form.desiredCompany.trim()) {
        payload.desiredCompany = form.desiredCompany.trim();
      }

      if (form.desiredLocation.trim()) {
        payload.desiredLocation = form.desiredLocation.trim();
      }

      if (typeof form.desiredSalary === "number") {
        payload.desiredSalary = form.desiredSalary;
      }

      if (form.tags.length > 0) {
        payload.tags = form.tags;
      }

      await upsertPref.mutateAsync(payload);

      toast.success("Đã lưu mong muốn nghề nghiệp");
      onClose();
    } catch (err: unknown) {
      toast.error("Không thể lưu mong muốn nghề nghiệp", {
        description: getAxiosErrorMessage(err),
      });
    }
  };

  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      {/* OVERLAY */}
      <div
        className="
          fixed inset-0
          bg-gradient-to-br from-blue-900/40 via-black/40 to-blue-800/40
          backdrop-blur-sm
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
            w-full max-w-lg
            rounded-2xl bg-white
            shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4)]
            border border-blue-100
            relative flex flex-col
          "
        >
          {/* LOADING */}
          {upsertPref.isPending && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-2xl z-20">
              <Loader size={28} />
            </div>
          )}

          {/* HEADER */}
          <div className="px-6 py-4 border-b border-blue-100 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-blue-700 flex items-center gap-2">
              <span className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4" />
              </span>
              Mong muốn nghề nghiệp của bạn{" "}
            </h2>

            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-800"
            >
              <X size={20} />
            </button>
          </div>

          {/* FORM */}
          <div className="px-6 py-4 space-y-5">
            {/* TITLE */}
            <div>
              <label
                htmlFor="desTitle"
                className="block font-medium text-gray-700"
              >
                Vị trí tuyển dụng
              </label>
              <input
                id="desTitle"
                value={form.desiredTitle}
                onChange={(e) => updateField("desiredTitle", e.target.value)}
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                "
              />
            </div>

            {/* TAGS */}
            <div>
              <label
                htmlFor="desTag"
                className="block font-medium text-gray-700"
              >
                Ngành nghề / Lĩnh vực
              </label>

              <TagsInput
                id="desTag"
                values={form.tags}
                onChange={(tags) => updateField("tags", tags)}
                placeholder="VD: React, Node.js, AWS"
              />
            </div>

            {/* COMPANY */}
            <div>
              <label
                htmlFor="desCompany"
                className="block font-medium text-gray-700"
              >
                Công ty mong muốn
              </label>
              <input
                id="desCompany"
                value={form.desiredCompany}
                onChange={(e) => updateField("desiredCompany", e.target.value)}
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                  transition
                "
              />
            </div>

            {/* LOCATION */}
            <div>
              <label
                htmlFor="desLocation"
                className="block font-medium text-gray-700"
              >
                Địa điểm
              </label>
              <input
                id="desLocation"
                value={form.desiredLocation}
                onChange={(e) => updateField("desiredLocation", e.target.value)}
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                "
              />
            </div>

            {/* SALARY */}
            <div>
              <label
                htmlFor="desSalary"
                className="block font-medium text-gray-700"
              >
                Mức lương mong muốn
              </label>
              <input
                id="desSalary"
                type="number"
                min={0}
                step={1000000}
                value={form.desiredSalary ?? ""}
                onChange={(e) =>
                  updateField(
                    "desiredSalary",
                    e.target.value ? Number(e.target.value) : null,
                  )
                }
                className="
                  mt-1 w-full rounded-xl border
                  px-4 py-2
                  focus:ring-2 focus:ring-blue-500/40
                  focus:border-blue-500
                "
              />
            </div>
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
              type="button"
              onClick={() => void handleSubmit()}
              className="
                px-5 py-2 rounded-xl
                bg-blue-600 text-white font-semibold
                hover:bg-blue-700
                cursor-pointer
              "
            >
              Lưu thông tin
            </button>
          </div>
        </MotionDialogPanel>
      </div>
    </Dialog>
  );
}
