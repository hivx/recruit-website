// src/components/admin/AdminJobList.tsx
import { ChevronLeft, ChevronRight, Briefcase } from "lucide-react";
import { useState } from "react";
import { JobApprovalDetailModal, JobApprovalCard } from "@/components/admin";
import { useJobs } from "@/hooks/useJobs";
import type { JobSearchQuery, Job } from "@/types";

export function AdminJobList() {
  const [page, setPage] = useState(1);
  const limit = 8;

  const [selectedJob, setSelectedJob] = useState<Job | null>(null);

  const filter: JobSearchQuery = {};
  const { data, isLoading, error } = useJobs(page, limit, filter);

  const jobs = data?.jobs ?? [];
  const totalPages = data?.totalPages ?? 1;
  const SKELETON_KEYS = Array.from(
    { length: 8 },
    (_, i) => `job-skeleton-${i}`,
  );

  /* ===================== LOADING ===================== */
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SKELETON_KEYS.map((key) => (
          <div
            key={key}
            className="
        h-40 rounded-2xl
        bg-gray-100 animate-pulse
      "
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 p-6 text-red-600">
        Không tải được danh sách công việc.
      </div>
    );
  }

  /* ===================== RENDER ===================== */
  return (
    <>
      {/* ===== LIST ===== */}
      {jobs.length === 0 ? (
        <div
          className="
            rounded-2xl border border-dashed
            bg-white p-12
            text-center text-gray-500
          "
        >
          <Briefcase className="mx-auto h-10 w-10 mb-3 text-blue-400" />
          <p className="text-sm">Chưa có bài đăng nào cần phê duyệt</p>
        </div>
      ) : (
        <div
          className="
            grid grid-cols-1 md:grid-cols-2 gap-6
            animate-fade-in
          "
        >
          {jobs.map((job) => (
            <JobApprovalCard key={job.id} job={job} onClick={setSelectedJob} />
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      {totalPages > 1 && (
        <div className="mt-10 flex items-center justify-center gap-3">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
            className="
              inline-flex items-center gap-1
              px-4 py-2 rounded-xl text-sm
              border bg-white
              hover:bg-blue-50 hover:text-blue-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            <ChevronLeft className="h-4 w-4" />
            Trước
          </button>

          <span
            className="
              px-4 py-2 rounded-xl text-sm font-medium
              bg-blue-50 text-blue-700
            "
          >
            Trang {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => setPage((p) => p + 1)}
            className="
              inline-flex items-center gap-1
              px-4 py-2 rounded-xl text-sm
              border bg-white
              hover:bg-blue-50 hover:text-blue-600
              disabled:opacity-40 disabled:cursor-not-allowed
              transition
            "
          >
            Sau
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* ===== MODAL ===== */}
      <JobApprovalDetailModal
        open={!!selectedJob}
        job={selectedJob}
        onClose={() => setSelectedJob(null)}
      />
    </>
  );
}
