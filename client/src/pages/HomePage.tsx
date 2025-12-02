import { useState } from "react";
import { JobSearchBar, JobList, RecommendedJobList } from "@/components";
import { useUserStore } from "@/stores";
import type { JobSearchQuery } from "@/types";

export function HomePage() {
  const [page, setPage] = useState(1);
  const [queryObj, setQueryObj] = useState<JobSearchQuery>({});
  const user = useUserStore((s) => s.user);

  return (
    <div className="w-full">
      {/* Banner / Search */}
      <JobSearchBar onSearch={setQueryObj} />

      <div className="max-w-7xl mx-auto px-4 mt-12 space-y-16">
        {/* ===================== NORMAL JOB LIST ===================== */}
        <section>
          <h2 className="text-2xl font-semibold mb-4">
            Tất cả việc làm nổi bật
          </h2>

          <JobList
            page={page}
            limit={9}
            query={queryObj}
            onPageChange={setPage}
          />
        </section>
        {/* ===================== RECOMMENDED JOBS ===================== */}
        {user && (
          <section>
            <h2 className="text-2xl font-semibold mb-4">
              Đề xuất dành cho bạn
            </h2>

            <RecommendedJobList userId={Number(user.id)} />
          </section>
        )}
      </div>
    </div>
  );
}
