// src/pages/HomePage.tsx
import { useState } from "react";
import { JobSearchBar, JobList, RecommendedJobList } from "@/components";
import { useUserStore } from "@/stores";
import type { JobSearchQuery } from "@/types";

export function HomePage() {
  const [page, setPage] = useState(1);
  const [queryObj, setQueryObj] = useState<JobSearchQuery>({});
  const user = useUserStore((s) => s.user);

  return (
    <div
      className="
        min-h-screen w-full 
        bg-gradient-to-br from-blue-50 via-white to-blue-100 
        pb-20 
      "
    >
      {/* ===================== SEARCH BANNER ===================== */}
      <div className="shadow-lg">
        <JobSearchBar onSearch={setQueryObj} />
      </div>

      {/* ===================== MAIN CONTENT ===================== */}
      <div className="max-w-7xl mx-auto px-4 mt-16 space-y-20">
        {/* -------- Job List -------- */}
        <section>
          <h2
            className="
              text-2xl font-bold mb-6 text-gray-800
              flex items-center gap-2
            "
          >
            <span className="w-2 h-6 bg-blue-500 rounded-full"></span>
            Tất cả việc làm nổi bật{" "}
          </h2>

          <JobList
            page={page}
            limit={9}
            query={queryObj}
            onPageChange={setPage}
          />
        </section>

        {/* -------- Recommended Jobs -------- */}
        {user && (
          <section>
            <h2
              className="
                text-2xl font-bold mb-6 text-gray-800
                flex items-center gap-2
              "
            >
              <span className="w-2 h-6 bg-purple-500 rounded-full"></span>
              Đề xuất dành cho bạn{" "}
            </h2>

            <RecommendedJobList userId={Number(user.id)} />
          </section>
        )}
      </div>
    </div>
  );
}
