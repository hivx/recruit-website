// src/components/RecommendedJobCard.tsx
import { Heart, AlertTriangle } from "lucide-react";
import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useAppNavigate } from "@/hooks";
import { toggleFavorite } from "@/services";
import { useUserStore, useFavoriteStore } from "@/stores";
import type { Job } from "@/types";
import { resolveImage, formatDateDMY } from "@/utils";

type RecommendedJobCardProps = Readonly<{
  job: Job;
  score?: number;
  reason?: string;
}>;

export function RecommendedJobCard({
  job,
  score,
  reason,
}: RecommendedJobCardProps) {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [popupSide, setPopupSide] = useState<"left" | "right">("right");
  const logoUrl = resolveImage(job.company?.logo);
  const jobId = Number(job.id);

  const navigate = useAppNavigate();

  // Auth + favorite state
  const token = useUserStore((s) => s.token);
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFav = useFavoriteStore((s) => s.toggle);

  const isFavorite = favorites.has(jobId);

  async function handleToggle(e: React.MouseEvent) {
    e.stopPropagation();

    if (!token) {
      navigate("/login");
      return;
    }

    toggleFav(jobId);

    try {
      await toggleFavorite(job.id);
    } catch {
      toggleFav(jobId);
    }
  }

  /* =============================
     SALARY DISPLAY
  ============================= */
  let salaryText: string | null = null;
  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  /* =============================
     DATE LOGIC
  ============================= */
  const postedDate = formatDateDMY(job.createdAt);
  const updatedDate = formatDateDMY(job.updatedAt);

  const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

  const isOutdated =
    job.updatedAt &&
    Date.now() - new Date(job.updatedAt).getTime() > SIX_MONTHS_MS;

  function handleDetectSide() {
    if (!cardRef.current) {
      return;
    }

    const rect = cardRef.current.getBoundingClientRect();
    const isRightHalf = rect.left > window.innerWidth / 2;

    setPopupSide(isRightHalf ? "left" : "right");
  }

  return (
    <div
      ref={cardRef}
      role="button"
      tabIndex={0}
      onMouseEnter={handleDetectSide}
      onFocus={handleDetectSide}
      className="
    group relative
    bg-white rounded-xl border shadow-sm
    hover:shadow-xl hover:border-blue-300
    transition-all duration-300 ease-out
    p-5 flex gap-4
  "
    >
      {/* ================= LOGO ================= */}
      <Link
        to={`/jobs/${job.id}`}
        className="
          min-w-[64px] h-[64px] flex items-center justify-center 
          rounded-lg overflow-hidden border border-gray-200 
          bg-gray-50 group-hover:border-blue-300 transition-all
        "
      >
        <img
          src={logoUrl}
          onError={(e) => {
            e.currentTarget.src = resolveImage(null);
          }}
          alt="logo"
          className="w-16 h-16 object-contain"
        />
      </Link>

      {/* ================= INFO ================= */}
      <div className="flex-1 space-y-1">
        <Link to={`/jobs/${job.id}`}>
          <h2
            className="
              text-base font-semibold text-gray-900 
              group-hover:text-blue-600 transition-colors duration-300
            "
          >
            {job.title}
          </h2>
        </Link>

        <p className="text-sm text-gray-600 font-medium">
          {job.company?.legalName}
        </p>

        {/* ===== DATES ===== */}
        <div className="pt-1 space-y-0.5">
          <p className="text-xs text-gray-400">Đăng ngày {postedDate}</p>

          <p className="flex items-center gap-1 text-xs text-gray-400">
            Cập nhật {updatedDate}
            {isOutdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-600 font-medium">
                <AlertTriangle className="w-4 h-4" />
                Quá 6 tháng chưa cập nhật
              </span>
            )}
          </p>
        </div>

        {/* ===== SCORE ===== */}
        {score !== undefined && (
          <span className="inline-block mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
            Độ phù hợp: {(score * 100).toFixed(0)}%
          </span>
        )}

        {/* ===== SALARY + LOCATION ===== */}
        <div className="flex flex-wrap gap-2 pt-2">
          {salaryText && (
            <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-md">
              {salaryText}
            </span>
          )}

          {job.location && (
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
              {job.location}
            </span>
          )}
        </div>

        {/* ===== TAGS ===== */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tags.map((t) => (
              <span
                key={t.tag?.id}
                className="
                  px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full 
                  hover:bg-blue-100 hover:text-blue-700 
                  transition-colors duration-200
                "
              >
                {t.tag?.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* ================= FAVORITE ================= */}
      <button
        onClick={(e) => void handleToggle(e)}
        className="
          self-start p-2 rounded-full 
          transition-all duration-300
          hover:bg-red-50
        "
      >
        <Heart
          size={22}
          className={`
            transition-all duration-300
            ${isFavorite ? "text-red-500 scale-125" : "text-gray-400"}
          `}
          {...(isFavorite ? { fill: "currentColor" } : {})}
        />
      </button>

      {/* ================= HOVER REASON POPUP ================= */}
      {reason && (
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
            Vì sao công việc này được đề xuất?
          </div>
          {reason}
        </div>
      )}
    </div>
  );
}
