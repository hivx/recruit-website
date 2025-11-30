import { Heart } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useAppNavigate } from "@/hooks";
import { toggleFavorite } from "@/services/favoriteService";
import { useUserStore } from "@/stores";
import type { Job } from "@/types";
import { resolveImage } from "@/utils";

type JobCardProps = Readonly<{
  job: Job;
}>;

export function JobCard({ job }: JobCardProps) {
  const logoUrl = resolveImage(job.company?.logo);

  const navigate = useAppNavigate();

  // FE state sync với BE isFavorite
  const [isFavorite, setIsFavorite] = useState(job.isFavorite === true);
  const token = useUserStore((s) => s.token); // 👈 Lấy token từ store

  const handleToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();

    // Nếu chưa login → chuyển về trang login
    if (!token) {
      navigate("/login");
      return;
    }

    // ✔ Nếu đã login → toggle bình thường
    setIsFavorite((prev) => !prev);

    try {
      await toggleFavorite(job.id);
    } catch {
      setIsFavorite((prev) => !prev);
    }
  };

  // Lương
  let salaryText: string | null = null;
  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  const postedDate = job.createdAt
    ? new Date(job.createdAt).toLocaleDateString("vi-VN")
    : "N/A";

  return (
    <div
      className="
        group bg-white rounded-xl border shadow-sm 
        hover:shadow-xl hover:border-blue-300
        transition-all duration-300 ease-out 
        p-5 flex gap-4 transform hover:-translate-y-1
      "
    >
      {/* Logo */}
      <Link
        to={`/jobs/${job.id}`}
        className="
          min-w-[64px] h-[64px] flex items-center justify-center 
          rounded-lg overflow-hidden border border-gray-200 
          bg-gray-50 group-hover:border-blue-300 transition-all
        "
      >
        <img src={logoUrl} alt="logo" className="w-16 h-16 object-contain" />
      </Link>

      {/* Info */}
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
        <p className="text-xs text-gray-400 pt-1">Đăng ngày {postedDate}</p>

        {/* Salary + Location */}
        <div className="flex flex-wrap gap-2 pt-1">
          <span className="px-2 py-1 text-sm bg-green-100 text-green-700 rounded-md">
            {salaryText}
          </span>

          {job.location && (
            <span className="px-2 py-1 text-sm bg-blue-100 text-blue-700 rounded-md">
              {job.location}
            </span>
          )}
        </div>

        {/* Tags */}
        {job.tags?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {job.tags.map((t) => (
              <span
                key={t.tagId}
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

      {/* Heart Favorite */}
      <button
        onClick={(e) => {
          void handleToggle(e);
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
  );
}
