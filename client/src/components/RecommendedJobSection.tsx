import { useState } from "react";
import { JobCard, Loader, ErrorBox } from "@/components";
import { useRecommendedJobs } from "@/hooks/useRecommendedJobs";
import { getAxiosErrorMessage } from "@/utils";

export interface RecommendedJobListProps {
  readonly userId: number;
}

export function RecommendedJobList({ userId }: RecommendedJobListProps) {
  const [page, setPage] = useState(1);
  const limit = 9;

  // Không có filters nữa
  const { data, isLoading, isError, error, refetch } = useRecommendedJobs(
    userId,
    { page, limit },
  );

  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-12">
        <Loader size={32} />
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

  const items = data?.items ?? [];
  console.log(items);
  const totalPages = data?.totalPages ?? 1;

  return (
    <div className="space-y-10">
      {/* ===== GRID ===== */}
      {items.length === 0 ? (
        <div className="text-center text-gray-500 py-10 text-lg">
          Không có gợi ý phù hợp
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {items.map((rec) => (
            <JobCard key={rec.jobId} job={rec.job} score={rec.fitScore} />
          ))}
        </div>
      )}

      {/* ===== PAGINATION ===== */}
      <div className="flex justify-center items-center gap-4 pt-4">
        <button
          disabled={page === 1}
          onClick={() => setPage((p) => p - 1)}
          className="px-4 py-2 rounded-lg border bg-white hover:bg-gray-100 disabled:bg-gray-200"
        >
          Trang trước
        </button>

        <span className="font-semibold text-gray-700">
          {page} / {totalPages}
        </span>

        <button
          disabled={page === totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
        >
          Trang sau
        </button>
      </div>
    </div>
  );
}
