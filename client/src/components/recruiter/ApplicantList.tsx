// src/components/recruiter/ApplicantList.tsx
import { Loader, ErrorBox } from "@/components";
import { ApplicantCard } from "@/components/recruiter";
import { useRecruiterApplications } from "@/hooks";
import type { Application } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export interface ApplicantListProps {
  readonly page: number;
  readonly limit: number;
  readonly status?: string;
  readonly jobId?: string;
  readonly onPageChange: (n: number) => void;
  readonly onSelectApplicant?: (app: Application) => void;
}

export function ApplicantList({
  page,
  limit,
  status,
  jobId,
  onPageChange,
  onSelectApplicant,
}: ApplicantListProps) {
  const { data, isLoading, isError, error, refetch } = useRecruiterApplications(
    { page, limit, status, jobId },
  );

  const applicants: Application[] = data?.applicants ?? [];
  const totalPages = data?.totalPages ?? 1;

  // ========== LOADING ==========
  if (isLoading) {
    return (
      <div className="w-full flex justify-center py-14">
        <Loader size={28} />
      </div>
    );
  }

  // ========== ERROR ==========
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
          rounded-2xl shadow-xl border border-gray-100
          p-6 md:p-8 backdrop-blur-sm
          bg-gradient-to-br from-blue-50/40 via-white to-blue-100/20
          transition-all
        "
      >
        {/* EMPTY */}
        {applicants.length === 0 && (
          <div className="w-full text-center text-gray-500 py-16 text-lg font-medium">
            Chưa có ứng viên nào ứng tuyển
          </div>
        )}

        {/* LIST */}
        <div className="flex flex-col gap-5">
          {applicants.map((app) => (
            <ApplicantCard
              key={app.id}
              app={app}
              onClick={() => onSelectApplicant?.(app)}
            />
          ))}
        </div>

        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="
              px-6 py-2.5 rounded-xl border border-blue-200
              bg-white text-blue-700 font-medium
              shadow-sm hover:shadow-md hover:scale-[1.03]
              transition-all
              disabled:bg-gray-100 disabled:text-gray-400
              disabled:shadow-none disabled:scale-100
            "
          >
            Trang trước
          </button>

          <span className="font-semibold text-blue-700 text-base">
            {page} / {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="
              px-6 py-2.5 rounded-xl 
              bg-blue-600 text-white font-semibold
              shadow-sm hover:shadow-lg hover:bg-blue-700 hover:scale-[1.05]
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
