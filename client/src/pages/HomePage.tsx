import { useState } from "react";
import { JobSearchBar } from "@/components/JobSearchBar";
import type { JobSearchQuery } from "@/components/JobSearchBar";
import { JobList } from "@/pages";

export function HomePage() {
  const [page, setPage] = useState(1);
  const [queryObj, setQueryObj] = useState<JobSearchQuery>({});

  return (
    <div className="w-full flex flex-col items-center mt-10 px-4">
      {/* SEARCH BAR — full width cố định */}
      <div className="min w-4xl mb-10">
        <JobSearchBar onSearch={setQueryObj} />
      </div>

      {/* JOB LIST — không ảnh hưởng search bar */}
      <div className="w-full max-w-8xl">
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
