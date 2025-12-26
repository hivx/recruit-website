// src/components/recruiter/RecommendedCandidateList.tsx
import { useState } from "react";
import { Loader, ErrorBox } from "@/components";
import { RecommendedCandidateCard } from "@/components/recruiter";
import { useRecommendedCandidates } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";

export interface RecommendedCandidateListProps {
  readonly recruiterId: number;
}

export function RecommendedCandidateList({
  recruiterId,
}: RecommendedCandidateListProps) {
  const [page, setPage] = useState(1);
  const limit = 9;

  const { data, isLoading, isError, error, refetch } = useRecommendedCandidates(
    recruiterId,
    { page, limit },
  );

  const items = data?.items ?? [];
  const totalPages = data?.totalPages ?? 1;

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

  return (
    <div className="animate-fade-in-up">
      <div
        className="
          bg-white rounded-2xl shadow-lg p-6 md:p-8
          border border-gray-100
          backdrop-blur-sm space-y-8
        "
      >
        {/* GRID */}
        {items.length === 0 ? (
          <div className="text-center text-gray-500 py-16 text-lg font-medium">
            Không có ứng viên phù hợp
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
            {items.map((rec) => (
              <RecommendedCandidateCard key={rec.id} candidate={rec} />
            ))}
          </div>
        )}

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 pt-6">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => p - 1)}
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
            onClick={() => setPage((p) => p + 1)}
            className="
              px-5 py-2.5 rounded-xl
              bg-blue-600 text-white font-medium
              shadow-sm hover:shadow-lg hover:bg-blue-700 hover:scale-[1.03]
              transition-all
              disabled:bg-blue-300 disabled:shadow-none disabled:scale-100
            "
          >
            Trang sau
          </button>
        </div>
      </div>
    </div>
  );
}
