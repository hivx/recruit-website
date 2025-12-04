import { useState } from "react";
import { MyJobList, JobStatsDashboard } from "@/components/recruiters";
import { useUserStore } from "@/stores";

export function RecruiterHomePage() {
  const [page, setPage] = useState(1);
  const user = useUserStore((s) => s.user);

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
            Chào {user?.name || "nhà tuyển dụng"}
          </h1>
          <p className="text-gray-600 mt-2">
            Quản lý bài đăng tuyển dụng và xem thống kê hiệu quả
          </p>
        </div>
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-20">
        {/* -------- JOB STATISTICS -------- */}
        <section>
          <h2
            className="
      text-2xl font-bold mb-6 text-gray-800
      flex items-center gap-2
    "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Thống kê bài đăng{" "}
          </h2>

          <JobStatsDashboard />
        </section>

        {/* -------- MY JOB LIST -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Bài đăng tuyển dụng của tôi{" "}
          </h2>

          <MyJobList page={page} limit={9} onPageChange={setPage} />
        </section>
      </div>
    </div>
  );
}
