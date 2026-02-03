// src/components/JobCard.tsx
import { Heart, AlertTriangle } from "lucide-react";
import { useState, lazy, Suspense, type MouseEvent } from "react";
import { Link } from "react-router-dom";
import { useFavoriteJob, useAppNavigate } from "@/hooks";
import { useUserStore } from "@/stores";
import type { Job } from "@/types";
import { resolveImage, getJobDates, formatSalary } from "@/utils";

// Lazy-load modal (named export -> default export)
const ApplyJobModalLazy = lazy(() =>
  import("@/components").then((m) => ({ default: m.ApplyJobModal })),
);

type JobCardProps = Readonly<{
  job: Job;
  score?: number;
}>;

export function JobCard({ job, score }: JobCardProps) {
  const [openApply, setOpenApply] = useState(false);
  const token = useUserStore((s) => s.token);
  const navigate = useAppNavigate();

  const logoUrl = resolveImage(job.company?.logo);

  const jobId = Number(job.id);
  const { isFavorite, toggle } = useFavoriteJob(jobId);

  const salaryText = formatSalary(job.salaryMin, job.salaryMax);

  const { postedDate, updatedDate, isOutdated } = getJobDates(
    job.createdAt,
    job.updatedAt,
  );

  function handleOpenApply(e?: MouseEvent<HTMLButtonElement>) {
    e?.stopPropagation();
    e?.preventDefault();

    if (!token) {
      navigate("/login");
      return;
    }

    setOpenApply(true);
  }

  return (
    <>
      {/* Card */}
      <div
        className="
          relative group bg-white rounded-xl border shadow-sm
          hover:shadow-xl hover:border-blue-300
          transition-all duration-300 ease-out
          p-5 flex gap-4 transform hover:-translate-y-1
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
            <p className="text-sm text-gray-700">Ngày đăng {postedDate}</p>

            <p className="flex items-center gap-1 text-sm text-gray-700">
              Cập nhật {updatedDate}
            </p>

            {isOutdated && (
              <span className="ml-2 inline-flex items-center gap-1 text-yellow-700 text-sm">
                <AlertTriangle className="w-4 h-4" />
                Quá 6 tháng chưa được cập nhật!
              </span>
            )}
          </div>

          {/* ===== SCORE ===== */}
          {score !== undefined && (
            <span className="inline-block mt-1 px-2 py-1 bg-blue-50 text-blue-700 text-xs font-semibold rounded-md">
              Độ phù hợp: {(score * 100).toFixed(2)}%
            </span>
          )}

          {/* ===== SALARY + LOCATION ===== */}
          <div className="flex flex-wrap gap-2 pt-1">
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
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            void toggle();
          }}
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

        {/* ================= APPLY (BOTTOM-RIGHT, SMALL, FIXED) ================= */}
        <button
          type="button"
          onClick={handleOpenApply}
          className="
            absolute bottom-3 right-3
            rounded-lg bg-blue-600 px-3 py-2
            text-xs font-semibold text-white
            shadow-md
            hover:bg-blue-700 hover:shadow-lg
            active:scale-[0.98]
            transition-all cursor-pointer
          "
        >
          Ứng tuyển
        </button>
      </div>

      {/* Modal sibling (giống UserInfoCard) => tránh lỗi stacking/overflow/transform */}
      <Suspense fallback={null}>
        <ApplyJobModalLazy
          open={openApply}
          jobId={job.id}
          jobTitle={job.title}
          onClose={() => setOpenApply(false)}
        />
      </Suspense>
    </>
  );
}
