// src/components/profile/RecruiterPreferencesCard.tsx
import { useState } from "react";
import { Loader, ErrorBox } from "@/components";
import { RecruiterPreferencesModal } from "@/components/profile";
import { useRecruiterPreferences } from "@/hooks";
import type { RecruiterPreference } from "@/types";

export function RecruiterPreferencesCard() {
  const { data, isLoading, isError, error, refetch } =
    useRecruiterPreferences();

  const [openModal, setOpenModal] = useState(false);

  // Loading state
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 h-40 flex items-center justify-center">
        <Loader size={28} />
      </div>
    );
  }

  // Error state
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
      <div className="bg-white rounded-2xl shadow-md p-6 border border-gray-100 space-y-4">
        {/* HEADER */}
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-700">
            Nhu cầu tuyển dụng
          </h2>

          <button
            onClick={() => setOpenModal(true)}
            className="
              px-4 py-2 rounded-xl bg-blue-600 text-white font-semibold
              hover:bg-blue-700 transition-all shadow-sm
            "
          >
            {pref ? "Cập nhật" : "Tạo"}
          </button>
        </div>

        {/* EMPTY STATE */}
        {!pref || (!pref.desiredTags.length && !pref.requiredSkills.length) ? (
          <div className="text-gray-500 italic py-4">
            Bạn chưa thiết lập nhu cầu tuyển dụng.
          </div>
        ) : (
          <div className="space-y-6">
            {/* LOCATION */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600">
                Địa điểm ưu tiên
              </h3>
              <p className="text-gray-800">
                {pref.desiredLocation ?? "Không có"}
              </p>
            </div>

            {/* SALARY */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600">
                Mức lương tuyển dụng
              </h3>
              <p className="text-gray-800">
                {pref.desiredSalaryAvg
                  ? pref.desiredSalaryAvg.toLocaleString() + " VNĐ"
                  : "Không có"}
              </p>
            </div>

            {/* TAGS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600">
                Ngành nghề/Lĩnh vực
              </h3>

              {pref.desiredTags.length === 0 ? (
                <p className="text-gray-500 italic">Không có</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-1">
                  {pref.desiredTags.map((t) => (
                    <span
                      key={t.id}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm"
                    >
                      {t.name}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* REQUIRED SKILLS */}
            <div>
              <h3 className="text-sm font-semibold text-gray-600">
                Kỹ năng cần thiết
              </h3>

              {pref.requiredSkills.length === 0 ? (
                <p className="text-gray-500 italic">Không có</p>
              ) : (
                <div className="space-y-2">
                  {pref.requiredSkills.map((s) => (
                    <div
                      key={s.id}
                      className="flex items-center justify-between p-3 border rounded-xl bg-gray-50"
                    >
                      <div>
                        <p className="font-medium text-gray-800">{s.name}</p>
                        <p className="text-gray-600 text-sm">
                          {s.yearsRequired === null
                            ? "Không yêu cầu kinh nghiệm"
                            : `${s.yearsRequired} năm kinh nghiệm`}
                        </p>
                      </div>

                      {s.mustHave && (
                        <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-700">
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
