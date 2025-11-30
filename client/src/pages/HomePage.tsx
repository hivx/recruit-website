import { useState } from "react";
import { JobSearchBar, JobList } from "@/components";
import type { JobSearchQuery } from "@/components/JobSearchBar";

export function HomePage() {
  const [page, setPage] = useState(1);
  const [queryObj, setQueryObj] = useState<JobSearchQuery>({});

  return (
    <div className="w-full">
      {/* Banner FULL WIDTH */}
      <JobSearchBar onSearch={setQueryObj} />

      {/* Job list + container */}
      <div className="max-w-7xl mx-auto px-4 mt-12">
        <JobList
          page={page}
          limit={9}
          query={queryObj}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}
