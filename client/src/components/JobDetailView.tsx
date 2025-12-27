// src/components/JobDetailView.tsx
import {
  MapPin,
  Banknote,
  Clock,
  Heart,
  Briefcase,
  Building2,
} from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { ApplyJobModal } from "@/components";
import { useJobById, useAppNavigate, useFavoriteJob } from "@/hooks";
import { useUserStore } from "@/stores";
import { resolveImage, formatDateDMY, formatSalary } from "@/utils";

interface Props {
  readonly jobId: string;
}

export function JobDetailView({ jobId }: Props) {
  const [openApply, setOpenApply] = useState(false);
  const token = useUserStore((s) => s.token); // Lấy token từ store
  const navigate = useAppNavigate();

  const jobDetailId = Number(jobId);
  const { isFavorite, toggle } = useFavoriteJob(jobDetailId);

  const { data: job, isLoading, error } = useJobById(jobId);
  if (!job) {
    return null;
  }

  if (!job.company) {
    return null;
  }

  const companyLogo = resolveImage(job.company.logo);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20 text-gray-500">
        Đang tải thông tin công việc…
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="flex justify-center py-20 text-red-500">
        Không thể tải thông tin công việc
      </div>
    );
  }

  // ===== Salary display =====
  const salaryText = formatSalary(job.salaryMin, job.salaryMax);

  // ===== Created date =====
  const createdDateText = formatDateDMY(job.createdAt);

  function handleOpenApply() {
    if (!token) {
      navigate("/login");
      return;
    }

    setOpenApply(true);
  }

  return (
    <div className="min-h-screen bg-blue-50/40 px-4 py-8">
      <div className="mx-auto max-w-6xl">
        <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
          {/* ================= LEFT: JOB INFO ================= */}
          <div className="md:col-span-8 rounded-2xl bg-white p-6 shadow-sm transition hover:shadow-md">
            {/* Header */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {job.title}
                </h1>

                <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4 text-blue-500" />
                    {job.location}
                  </span>

                  {salaryText && (
                    <span className="flex items-center gap-1">
                      <Banknote className="h-4 w-4 text-blue-500" />
                      {salaryText}
                    </span>
                  )}

                  <span className="flex items-center gap-1">
                    <Clock className="h-4 w-4 text-blue-500" />
                    Đăng ngày {createdDateText}
                  </span>
                </div>
              </div>

              {/* Favorite */}
              <button
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
            </div>

            {/* Tags */}
            {job.tags?.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {job.tags.map((t) => (
                  <span
                    key={`${job.id}-${t.tagId}`}
                    className="
                      rounded-full bg-blue-50 px-3 py-1
                      text-xs font-medium text-blue-700
                    "
                  >
                    {t.tag?.name}
                  </span>
                ))}
              </div>
            )}

            {/* Apply button */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleOpenApply}
                className="
                  w-full rounded-xl bg-blue-600 px-6 py-3
                  font-semibold text-white
                  shadow-md
                  hover:bg-blue-700 hover:shadow-lg
                  active:scale-[0.98]
                  transition-all cursor-pointer
                "
              >
                Ứng tuyển ngay
              </button>
            </div>

            {/* Description */}
            <section className="mt-10">
              <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                <Briefcase className="h-5 w-5 text-blue-500" />
                Mô tả công việc
              </h2>
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                {job.description}
              </p>
            </section>

            {/* Requirements */}
            <section className="mt-8">
              <h2 className="mb-3 text-lg font-semibold text-gray-900">
                Yêu cầu
              </h2>
              <p className="whitespace-pre-line text-gray-700 leading-relaxed">
                {job.requirements}
              </p>
            </section>

            {/* Required skills */}
            {job.requiredSkills?.length > 0 && (
              <section className="mt-8">
                <h2 className="mb-4 text-lg font-semibold text-gray-900">
                  Kỹ năng yêu cầu
                </h2>

                <ul className="space-y-3">
                  {job.requiredSkills.map((skill) => (
                    <li
                      key={skill.skillId}
                      className="
                        flex items-center justify-between
                        rounded-xl border bg-gray-50 px-4 py-3
                        hover:border-blue-300
                        transition
                      "
                    >
                      <span className="font-medium text-gray-800">
                        {skill.name}
                      </span>

                      <span className="text-sm text-gray-600">
                        {skill.yearsRequired} năm kinh nghiệm
                        {skill.mustHave && (
                          <span className="ml-2 rounded bg-red-100 px-2 py-0.5 text-xs text-red-700">
                            Ưu tiên
                          </span>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </div>

          {/* ================= RIGHT: COMPANY INFO ================= */}
          <div className="hidden md:block md:col-span-4">
            <div className="sticky top-24">
              <div
                className="
                  rounded-3xl bg-white p-8
                  shadow-sm transition-all duration-300
                  hover:shadow-lg
                "
              >
                <Link
                  to={`/companies/${job.company?.id}`}
                  className="group block text-center"
                >
                  {/* ===== Logo wrapper ===== */}
                  <div
                    className="
                      relative mx-auto
                      flex h-48 w-64 items-center justify-center
                      rounded-2xl
                      bg-gradient-to-br from-blue-50 to-blue-100
                      ring-1 ring-blue-200/60
                      shadow-inner
                      transition-all duration-300
                      group-hover:scale-105
                    "
                  >
                    <img
                      src={companyLogo}
                      alt={job.company?.legalName}
                      className="
                        h-40 w-50 rounded-xl object-cover
                        bg-white
                        shadow-md
                      "
                    />

                    {/* subtle glow */}
                    <div
                      className="
                        pointer-events-none absolute inset-0
                        rounded-2xl
                        opacity-0
                        group-hover:opacity-100
                        transition
                        ring-2 ring-blue-300/40
                      "
                    />
                  </div>

                  {/* ===== Company name ===== */}
                  <h3
                    className="
                      mt-5 text-lg font-semibold text-gray-900
                      transition group-hover:text-blue-700
                    "
                  >
                    {job.company?.legalName}
                  </h3>

                  {/* ===== CTA ===== */}
                  <p
                    className="
                      mt-2 inline-flex items-center gap-1
                      text-sm font-medium text-blue-600
                      transition group-hover:text-blue-700
                    "
                  >
                    <Building2 className="h-4 w-4" />
                    Xem chi tiết công ty
                  </p>
                </Link>
              </div>
            </div>
          </div>
          <ApplyJobModal
            open={openApply}
            jobId={job.id}
            jobTitle={job.title}
            onClose={() => setOpenApply(false)}
          />
        </div>
      </div>
    </div>
  );
}
