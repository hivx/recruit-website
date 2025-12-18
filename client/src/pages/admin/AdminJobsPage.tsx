// src/pages/admin/AdminJobsPage.tsx
import { JobApprovalCountChart, AdminJobList } from "@/components/admin";
import { useJobs } from "@/hooks/useJobs";
import { useUserStore } from "@/stores";
import type { JobSearchQuery } from "@/types";

export function AdminJobsPage() {
  const user = useUserStore((s) => s.user);

  const limit = 10;

  // admin lấy tất cả job (dùng cho chart)
  const filter: JobSearchQuery = {};

  const { data, isLoading } = useJobs(1, limit, filter);
  const jobs = data?.jobs ?? [];

  return (
    <div
      className="
        min-h-screen w-full
        bg-gradient-to-br from-blue-50 via-white to-blue-100
        pb-20
      "
    >
      {/* ===================== HEADER ===================== */}
      <div className="shadow-lg bg-white py-10">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-800">
            Quản lý công việc tuyển dụng
          </h1>
          <p className="text-gray-600 mt-2">
            Xin chào {user?.name || "quản trị viên"}, theo dõi và phê duyệt các
            công việc trong hệ thống.
          </p>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-20">
        {/* -------- JOB APPROVAL STATISTICS -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Thống kê phê duyệt công việc{" "}
          </h2>

          {!isLoading && <JobApprovalCountChart jobs={jobs} />}
        </section>

        {/* -------- JOB APPROVAL LIST -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-green-500 rounded-full"></span>
            Danh sách tất cả bài đăng{" "}
          </h2>

          <AdminJobList />
        </section>
      </div>
    </div>
  );
}
