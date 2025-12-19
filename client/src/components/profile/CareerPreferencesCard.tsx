// src/components/profile/CareerPreferencesCard.tsx
import {
  Briefcase,
  Building2,
  MapPin,
  Banknote,
  Tags,
  Sparkles,
  Plus,
  Pencil,
} from "lucide-react";
import { useState } from "react";

import { CareerPreferencesModal } from "@/components/profile";
import { useCareerPreference } from "@/hooks";

export function CareerPreferencesCard() {
  const { data, isLoading, isError } = useCareerPreference();
  const [openModal, setOpenModal] = useState(false);

  /* =============================
     LOADING
  ============================= */
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6 h-40 flex items-center justify-center">
        <span className="text-sm text-gray-500">
          Đang tải mong muốn nghề nghiệp…
        </span>
      </div>
    );
  }

  /* =============================
     ERROR
  ============================= */
  if (isError) {
    return (
      <div className="bg-white rounded-2xl shadow-md p-6">
        <p className="text-sm text-red-500">
          Không thể tải mong muốn nghề nghiệp
        </p>
      </div>
    );
  }

  /* =============================
     EMPTY STATE (EARLY RETURN)
     → Sau đoạn này TS hiểu pref KHÔNG null
  ============================= */
  if (!data) {
    return (
      <>
        <div
          className="
            bg-white rounded-2xl border border-blue-100
            p-6 space-y-6
            shadow-sm
          "
        >
          {/* HEADER */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold text-gray-800">
                Mong muốn nghề nghiệp
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
              <Plus className="w-4 h-4" />
              Tạo
            </button>
          </div>

          {/* EMPTY CONTENT */}
          <div
            className="
              flex items-center gap-3
              text-gray-500 italic
              bg-blue-50/50
              p-4 rounded-xl
            "
          >
            <Plus className="w-5 h-5 text-blue-400" />
            Bạn chưa thiết lập mong muốn nghề nghiệp.
          </div>
        </div>

        <CareerPreferencesModal
          open={openModal}
          onClose={() => setOpenModal(false)}
        />
      </>
    );
  }

  /* =============================
     DATA READY (pref is NON-NULL)
  ============================= */
  const pref = data;
  const tags = pref.tags ?? [];

  const salaryText =
    typeof pref.desiredSalary === "number"
      ? pref.desiredSalary.toLocaleString()
      : "Thỏa thuận";

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
              <Sparkles className="w-5 h-5" />
            </div>
            <h2 className="text-lg font-semibold text-gray-800">
              Mong muốn nghề nghiệp
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
            <Pencil className="w-4 h-4" />
            Cập nhật
          </button>
        </div>

        {/* CONTENT – 2 COLUMNS */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN */}
          <div className="space-y-5">
            {pref.desiredTitle && (
              <div className="flex items-start gap-3">
                <Briefcase className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Vị trí mong muốn</p>
                  <p className="font-medium text-gray-800">
                    {pref.desiredTitle}
                  </p>
                </div>
              </div>
            )}

            {pref.desiredCompany && (
              <div className="flex items-start gap-3">
                <Building2 className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Công ty yêu thích</p>
                  <p className="font-medium text-gray-800">
                    {pref.desiredCompany}
                  </p>
                </div>
              </div>
            )}

            {pref.desiredLocation && (
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-blue-500 mt-0.5" />
                <div>
                  <p className="text-sm text-gray-500">Địa điểm làm việc</p>
                  <p className="font-medium text-gray-800">
                    {pref.desiredLocation}
                  </p>
                </div>
              </div>
            )}

            <div className="flex items-start gap-3">
              <Banknote className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <p className="text-sm text-gray-500">Mức lương mong muốn</p>
                <p className="font-medium text-gray-800">
                  {salaryText.toLocaleString() + " VNĐ"}
                </p>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Tags className="w-5 h-5 text-blue-500" />
              <p className="text-sm font-semibold text-gray-600">
                Ngành nghề / Lĩnh vực quan tâm
              </p>
            </div>

            {tags.length === 0 ? (
              <p className="text-gray-500 italic">
                Chưa thiết lập lĩnh vực quan tâm
              </p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {tags.map((t) => (
                  <span
                    key={t.id}
                    className="
                      px-3 py-1 rounded-full text-sm
                      bg-blue-100 text-blue-700
                      hover:bg-blue-200
                      transition
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

      {/* MODAL */}
      <CareerPreferencesModal
        open={openModal}
        onClose={() => setOpenModal(false)}
      />
    </>
  );
}
