// src/components/recruiter/MyJobList.tsx
import { useState } from "react";
import { RecruiterJobCard, Loader, ErrorBox, ConfirmPopup } from "@/components";
import {
  useMyJobs,
  useSyncFavoritesFromJobs,
  useDeleteJob,
  useAppNavigate,
} from "@/hooks";
import type { Job } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export interface MyJobListProps {
  readonly page: number;
  readonly limit: number;
  readonly onPageChange: (n: number) => void;
}

type ActionMode = "view" | "edit" | "delete";

export function MyJobList({ page, limit, onPageChange }: MyJobListProps) {
  const { data, isLoading, isError, error, refetch } = useMyJobs(page, limit);

  const [mode, setMode] = useState<ActionMode>("view");
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const navigate = useAppNavigate();
  const { mutateAsync: deleteJobMutate } = useDeleteJob();

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

  function handleJobClick(job: Job) {
    if (mode === "edit") {
      navigate(`/recruiter/jobs/${job.id}/edit`);
      return;
    }

    if (mode === "delete") {
      setSelectedJob(job);
      setConfirmOpen(true);
      return;
    }

    navigate(`/jobs/${job.id}`);
  }

  async function handleConfirmDelete() {
    if (!selectedJob) {
      return;
    }

    setDeleting(true);

    await deleteJobMutate(selectedJob.id);
    setDeleting(false);
    setConfirmOpen(false);
    setMode("view"); // reset mode sau khi xóa

    setSelectedJob(null);
  }
  function getAriaLabel(mode: ActionMode, title: string): string {
    switch (mode) {
      case "edit":
        return `Sửa tin tuyển dụng ${title}`;
      case "delete":
        return `Xóa tin tuyển dụng ${title}`;
      case "view":
        return `Xem tin tuyển dụng ${title}`;
    }
  }

  return (
    <div className="animate-fade-in-up">
      <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8 border border-gray-100">
        {/* ACTION BAR */}
        <div className="flex items-center gap-3 mb-4">
          <button
            type="button"
            onClick={() => navigate("/recruiter/jobs/create")}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white font-medium hover:bg-blue-700 transition cursor-pointer"
          >
            + Tạo mới
          </button>

          <button
            type="button"
            onClick={() => setMode("edit")}
            className={`px-4 py-2 rounded-lg font-medium transition hover:bg-yellow-300 cursor-pointer ${
              mode === "edit"
                ? "bg-blue-100 text-blue-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Sửa
          </button>

          <button
            type="button"
            onClick={() => setMode("delete")}
            className={`px-4 py-2 rounded-lg font-medium transition hover:bg-red-200 cursor-pointer ${
              mode === "delete"
                ? "bg-red-100 text-red-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            Xóa
          </button>

          {mode !== "view" && (
            <button
              type="button"
              onClick={() => setMode("view")}
              className="ml-auto text-sm text-gray-500 hover:underline"
            >
              Thoát chế độ
            </button>
          )}
        </div>

        {/* MODE HINT */}
        {mode !== "view" && (
          <div
            className={`mb-4 px-4 py-2 rounded-lg text-sm font-medium ${
              mode === "edit"
                ? "bg-blue-50 text-blue-700"
                : "bg-red-50 text-red-700"
            }`}
          >
            {mode === "edit"
              ? "Chế độ sửa: Click vào job để chỉnh sửa"
              : "Chế độ xóa: Click vào job để xóa"}
          </div>
        )}

        {/* EMPTY */}
        {jobList.length === 0 && (
          <div className="w-full text-center text-gray-500 py-16 text-lg font-medium">
            Bạn chưa có bài đăng tuyển dụng nào
          </div>
        )}

        {/* GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-7">
          {jobList.map((job) => {
            const isViewMode = mode === "view";

            return (
              <div
                key={job.id}
                role="button"
                tabIndex={0}
                aria-label={getAriaLabel(mode, job.title)}
                onClick={() => handleJobClick(job)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleJobClick(job);
                  }
                }}
                className={`
                  w-full text-left transition cursor-pointer rounded-xl
                  focus:outline-none focus:ring-2 focus:ring-blue-400
                  ${mode === "edit" ? "hover:ring-2 hover:ring-blue-300" : ""}
                  ${mode === "delete" ? "hover:ring-2 hover:ring-red-300" : ""}
                `}
              >
                <div className={isViewMode ? "" : "pointer-events-none"}>
                  <RecruiterJobCard job={job} />
                </div>
              </div>
            );
          })}
        </div>
        {/* PAGINATION */}
        <div className="flex justify-center items-center gap-4 pt-10">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-5 py-2.5 rounded-xl border bg-white text-gray-700"
          >
            Trang trước
          </button>

          <span className="font-semibold text-gray-700">
            {page} / {totalPages}
          </span>

          <button
            type="button"
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-5 py-2.5 rounded-xl bg-blue-600 text-white"
          >
            Trang sau
          </button>
        </div>
      </div>

      {/* CONFIRM DELETE */}
      <ConfirmPopup
        open={confirmOpen}
        title="Xóa tin tuyển dụng"
        message={`Bạn có chắc chắn muốn xóa tin "${selectedJob?.title}" không?`}
        loading={deleting}
        onCancel={() => {
          setConfirmOpen(false);
          setSelectedJob(null);
        }}
        onConfirm={() => void handleConfirmDelete()}
      />
    </div>
  );
}
