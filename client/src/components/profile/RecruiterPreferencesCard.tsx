// src/components/profile/RecruiterPreferencesCard.tsx
import {
  MapPin,
  DollarSign,
  Tags,
  Wrench,
  CheckCircle2,
  Plus,
  Pencil,
} from "lucide-react";
import { useState } from "react";

import { Loader, ErrorBox } from "@/components";
import { RecruiterPreferencesModal } from "@/components/profile";
import { useRecruiterPreferences } from "@/hooks";
import type { RecruiterPreference } from "@/types";

export function RecruiterPreferencesCard() {
  const { data, isLoading, isError, error, refetch } =
    useRecruiterPreferences();

  const [openModal, setOpenModal] = useState(false);

  /* =============================
     LOADING
  ============================= */
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 h-40 flex items-center justify-center">
        <Loader size={28} />
      </div>
    );
  }

  /* =============================
     ERROR
  ============================= */
  if (isError) {
    return (
      <ErrorBox
        message={error?.message ?? "Không thể tải nhu cầu tuyển dụng"}
        onRetry={() => void refetch()}
      />
    );
  }

  const pref: RecruiterPreference | null = data ?? null;

  return (
    <>
      {/* CARD */}
      <div
        className="
          bg-white rounded-2xl border border-blue-100
          p-6 space-y-6
          shadow-sm
          hover:shadow-lg hover:-translate-y-0.5
          transition-all duration-300
        "
      >
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Nhu cầu tuyển dụng
            </h2>
          </div>

          <button
            onClick={() => setOpenModal(true)}
            className="
              inline-flex items-center gap-2
              px-4 py-2 rounded-xl
              bg-gradient-to-r from-blue-600 to-blue-500
              text-white font-semibold text-sm
              hover:from-blue-700 hover:to-blue-600
              shadow-md
              active:scale-95
              transition cursor-pointer
            "
          >
            {pref ? (
              <Pencil className="w-4 h-4" />
            ) : (
              <Plus className="w-4 h-4" />
            )}
            {pref ? "Cập nhật" : "Tạo"}
          </button>
        </div>

        {/* EMPTY STATE */}
        {!pref || (!pref.desiredTags.length && !pref.requiredSkills.length) ? (
          <div
            className="
              flex items-center gap-3
              text-gray-500 italic
              bg-blue-50/50
              p-4 rounded-xl
            "
          >
            <Plus className="w-5 h-5 text-blue-400" />
            Bạn chưa thiết lập nhu cầu tuyển dụng.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* LEFT COLUMN */}
            <div className="space-y-5">
              {/* LOCATION */}
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Địa điểm ưu tiên</p>
                  <p className="font-medium text-gray-800">
                    {pref.desiredLocation ?? "Không có"}
                  </p>
                </div>
              </div>

              {/* SALARY */}
              <div className="flex items-start gap-3">
                <DollarSign className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Mức lương tuyển dụng</p>
                  <p className="font-medium text-gray-800">
                    {pref.desiredSalaryAvg
                      ? pref.desiredSalaryAvg.toLocaleString() + " VNĐ"
                      : "Không có"}
                  </p>
                </div>
              </div>

              {/* TAGS */}
              <div className="flex items-start gap-3">
                <Tags className="w-5 h-5 text-blue-500 mt-1" />
                <div>
                  <p className="text-sm text-gray-500">Ngành nghề / Lĩnh vực</p>

                  {pref.desiredTags.length === 0 ? (
                    <p className="text-gray-500 italic">Không có</p>
                  ) : (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {pref.desiredTags.map((t) => (
                        <span
                          key={t.id}
                          className="
                            px-3 py-1 rounded-full text-sm
                            bg-blue-100 text-blue-700
                          "
                        >
                          {t.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN – SKILLS */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-blue-500" />
                <p className="text-sm font-semibold text-gray-600">
                  Kỹ năng cần thiết
                </p>
              </div>

              {pref.requiredSkills.length === 0 ? (
                <p className="text-gray-500 italic">Không có</p>
              ) : (
                <div className="space-y-2">
                  {pref.requiredSkills.map((s) => (
                    <div
                      key={s.id}
                      className="
                        p-3 rounded-xl
                        border border-gray-200
                        bg-gradient-to-br from-white to-blue-50
                        flex items-center justify-between
                        hover:shadow-sm
                        transition
                      "
                    >
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-sm text-gray-600">
                          {s.yearsRequired === null
                            ? "Không yêu cầu kinh nghiệm"
                            : `${s.yearsRequired} năm kinh nghiệm`}
                        </p>
                      </div>

                      {s.mustHave && (
                        <span
                          className="
                            text-xs font-medium
                            px-2 py-1 rounded-lg
                            bg-red-100 text-red-700
                          "
                        >
                          Bắt buộc
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* MODAL */}
      <RecruiterPreferencesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        pref={pref}
      />
    </>
  );
}
