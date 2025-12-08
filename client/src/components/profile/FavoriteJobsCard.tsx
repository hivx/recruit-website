// src/components/profile/FavoriteJobsCard.tsx
import { motion } from "framer-motion";
import { Heart, MapPin, Building2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { useFavoriteJobs } from "@/hooks";
import type { Job } from "@/types";
import { formatDateDMY } from "@/utils";

/* =============================
   CARD CHÍNH
============================= */
export function FavoriteJobsCard() {
  const { data, isLoading, error } = useFavoriteJobs();

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      className="
        relative rounded-3xl border bg-white p-7 shadow-md 
        transition-all duration-300 hover:shadow-xl overflow-hidden
      "
    >
      {/* Background gradient subtle */}
      <div className="absolute inset-0 bg-gradient-to-br from-red-50 via-white to-white opacity-70 pointer-events-none" />

      {/* Header */}
      <div className="relative z-10 mb-5 flex items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 bg-red-300 blur-xl opacity-40 rounded-full"></div>
          <Heart size={26} className="text-red-600 relative z-10" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight">
          Công việc đã yêu thích
        </h2>
      </div>

      {/* LOADING */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2].map((i) => (
            <div
              key={i}
              className="h-28 rounded-xl bg-gray-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* ERROR */}
      {error && (
        <p className="text-red-500 text-sm mt-4">
          Không thể tải danh sách yêu thích.
        </p>
      )}

      {/* EMPTY STATE */}
      {data?.total === 0 && (
        <div className="text-gray-500 text-center py-10 text-sm">
          Bạn chưa yêu thích công việc nào.
        </div>
      )}

      {/* LIST */}
      {data && data.total > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {data.jobs.map((job) => (
            <FavoriteJobItem key={job.id} job={job} />
          ))}
        </div>
      )}
    </motion.div>
  );
}

/* =============================
   JOB ITEM CARD
============================= */
function FavoriteJobItem({ job }: { readonly job: Job }) {
  return (
    <Link to={`/jobs/${job.id}`} className="block">
      <motion.div
        whileHover={{ scale: 1.03, translateY: -3 }}
        transition={{ type: "spring", stiffness: 180, damping: 15 }}
        className="
          relative rounded-xl border bg-white p-5 shadow-sm
          cursor-pointer transition-all duration-300 
          hover:shadow-lg hover:border-red-300 group
        "
      >
        {/* Glow effect */}
        <div className="absolute -top-2 -right-2 w-16 h-16 bg-red-100 blur-2xl opacity-40 rounded-full pointer-events-none"></div>

        <div className="flex items-start gap-4">
          {/* TEXT CONTENT */}
          <div className="flex-1">
            <h3
              className="
                font-semibold text-lg text-gray-900 leading-tight
                group-hover:text-red-600 transition-colors
              "
            >
              {job.title}
            </h3>

            {/* COMPANY */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <Building2 size={16} className="text-gray-500" />
              <span>{job.company?.legalName}</span>
            </div>

            {/* LOCATION */}
            <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
              <MapPin size={16} className="text-gray-500" />
              <span>{job.location}</span>
            </div>

            {/* DATE */}
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-3">
              <Clock size={14} />
              <span>Thêm vào: {formatDateDMY(job.createdAt)}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
