// src/components/recruiter/RecommendedCandidateCard.tsx
import { Mail } from "lucide-react";
import { useRef, useState } from "react";
import type { CandidateRecommendation } from "@/types";
import { resolveImage, formatDateDMY } from "@/utils";

type RecommendedCandidateCardProps = Readonly<{
  candidate: CandidateRecommendation;
}>;

export function RecommendedCandidateCard({
  candidate,
}: RecommendedCandidateCardProps) {
  const cardRef = useRef<HTMLButtonElement | null>(null);
  const [popupSide, setPopupSide] = useState<"left" | "right">("right");

  const avatarUrl = resolveImage(candidate.applicant.avatar);

  function handleDetectSide() {
    if (!cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    setPopupSide(rect.left > window.innerWidth / 2 ? "left" : "right");
  }

  const recommendedDate = formatDateDMY(candidate.recommendedAt);
  const fitPercent = Math.round(candidate.fitScore * 100);

  return (
    <button
      ref={cardRef}
      type="button"
      onMouseEnter={handleDetectSide}
      onFocus={handleDetectSide}
      className="
        group relative
        bg-white rounded-xl border shadow-sm
        hover:shadow-xl hover:border-blue-300
        transition-all duration-300 ease-out
        p-5 flex gap-4
        text-left
      "
    >
      {/* ===== AVATAR ===== */}
      <div
        className="
          min-w-[56px] h-[56px]
          rounded-full overflow-hidden
          border border-gray-200
          bg-gray-50
        "
      >
        <img
          src={avatarUrl}
          onError={(e) => {
            e.currentTarget.src = resolveImage(null);
          }}
          alt="avatar"
          className="w-full h-full object-cover"
        />
      </div>

      {/* ===== MAIN INFO ===== */}
      <div className="flex-1 space-y-1">
        {/* NAME + SCORE */}
        <div className="flex items-start justify-between gap-2">
          <div>
            <h2
              className="
                text-base font-semibold text-gray-900
                group-hover:text-blue-600 transition-colors
              "
            >
              {candidate.applicant.name}
            </h2>

            {candidate.applicant.email && (
              <div className="flex items-center gap-1 text-sm text-gray-600">
                <Mail className="w-4 h-4" />
                <span className="truncate">{candidate.applicant.email}</span>
              </div>
            )}
            <span
              className="
              shrink-0 px-2.5 py-1
              bg-blue-50 text-blue-700
              text-xs font-semibold rounded-md
            "
            >
              {fitPercent}% phù hợp
            </span>
          </div>
        </div>

        {/* META */}
        <div className="flex items-center justify-between pt-2">
          <p className="text-xs text-gray-700">Gợi ý ngày {recommendedDate}</p>
        </div>
      </div>

      {/* ===== REASON POPUP (PHỤ) ===== */}
      {candidate.reason && (
        <div
          className={`
            absolute top-0
            ${popupSide === "right" ? "left-full ml-3" : "right-full mr-3"}
            z-50 w-[320px]
            bg-white border border-gray-200 rounded-xl
            shadow-xl
            p-3
            text-xs text-gray-700
            leading-relaxed
            whitespace-pre-line
            opacity-0 group-hover:opacity-100
            translate-y-2 group-hover:translate-y-0
            transition-all duration-200
            pointer-events-none
          `}
        >
          <div className="font-semibold text-gray-900 mb-2">
            Vì sao ứng viên này được đề xuất?
          </div>
          {candidate.reason}
        </div>
      )}
    </button>
  );
}
