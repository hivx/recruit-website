import { JobCard, Loader, ErrorBox } from "@/components";
import type { JobSearchQuery } from "@/components";
import { useJobs } from "@/hooks";
import type { Job } from "@/types";
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

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-10">
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

  const jobList: Job[] = data?.jobs ?? [];
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-8 animate-fade-in min-h-[300px]">
      {/* GRID */}
      {jobList.length === 0 && (
        <div className="w-full text-center text-gray-500 py-10 text-lg">
          Không tìm thấy công việc phù hợp
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {jobList.map((job) => (
          <JobCard key={job.id} job={job} />
        ))}
      </div>

      {/* PAGINATION */}
      <div className="flex justify-center items-center gap-3 pt-4">
        <button
          disabled={page === 1}
          onClick={() => onPageChange(page - 1)}
          className="
            cursor-pointer
            px-4 py-2 rounded-md border 
            bg-white hover:bg-gray-100 
            disabled:bg-gray-200 disabled:text-gray-400 disabled:cursor-not-allowed
          "
        >
          Trang trước
        </button>

        <span className="font-semibold text-gray-700">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => onPageChange(page + 1)}
          className="
            cursor-pointer
            px-4 py-2 rounded-md 
            bg-blue-600 text-white 
            hover:bg-blue-700 
            disabled:bg-blue-300 disabled:cursor-not-allowed
          "
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
