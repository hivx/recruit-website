import { JobCard, Loader, ErrorBox } from "@/components";
import { useJobs, useSyncFavoritesFromJobs } from "@/hooks";
import type { Job, JobSearchQuery } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export interface JobListProps {
  readonly page: number;
  readonly limit: number;
  readonly query: JobSearchQuery;
  readonly onPageChange: (n: number) => void;
}

export function JobList({ page, limit, query, onPageChange }: JobListProps) {
  const { data, isLoading, isError, error, refetch } = useJobs(
    page,
    limit,
    query,
  );

  const jobList: Job[] = data?.jobs ?? [];
  const totalPages = data?.totalPages ?? 1;

  useSyncFavoritesFromJobs(jobList);

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-14">
        <Loader size={28} />
      </div>
    );
  }

  if (isError) {
    return (
      <ErrorBox
        message={getAxiosErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  return (
    <div className="animate-fade-in-up">
      {/* WRAPPER CARD */}
      <div
        className="
          bg-white rounded-2xl shadow-lg p-6 md:p-8 
          border border-gray-100 
          backdrop-blur-sm
        "
      >
        {/* EMPTY */}
        {jobList.length === 0 && (
          <div className="w-full text-center text-gray-500 py-16 text-lg font-medium">
            Không tìm thấy công việc phù hợp
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {jobList.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="
              px-5 py-2.5 rounded-xl border border-gray-300
              bg-white text-gray-700 font-medium
              shadow-sm hover:shadow-md hover:scale-[1.02]
              transition-all
              disabled:bg-gray-100 disabled:text-gray-400 disabled:shadow-none disabled:scale-100
            "
          >
            Trang trước
          </button>

          <span className="font-semibold text-gray-700 text-base">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="
              px-5 py-2.5 rounded-xl 
              bg-blue-600 text-white font-medium
              shadow-sm hover:shadow-lg hover:bg-blue-700 hover:scale-[1.03]
              transition-all
              disabled:bg-blue-300 disabled:text-white disabled:shadow-none disabled:scale-100
            "
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
