// src/pages/JobDetailPage.tsx
import { ArrowLeft } from "lucide-react";
import { useParams } from "react-router-dom";
import { ErrorBox, Loader, JobDetailView } from "@/components";
import { useJobById, useAppNavigate } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useAppNavigate();

  const {
    data: jobDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobById(id);

  // Loading
  if (isLoading) {
    return (
      <div className="flex justify-center py-24">
        <Loader size={18} />
      </div>
    );
  }

  // Error
  if (isError) {
    return (
      <ErrorBox
        message={getAxiosErrorMessage(error)}
        onRetry={() => {
          void refetch();
        }}
      />
    );
  }

  // Not found
  if (!jobDetail || !id) {
    return (
      <div className="p-6 text-center text-gray-500">
        Không tìm thấy công việc!
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50/60 to-white">
      <div className="mx-auto max-w-6xl px-4 py-6">
        {/* ===== Back button ===== */}
        <button
          type="button"
          onClick={() => navigate("/")}
          className="
            mb-6 inline-flex items-center gap-2
            rounded-xl border border-blue-200 bg-white px-4 py-2
            text-sm font-medium text-blue-600
            shadow-sm
            hover:bg-blue-50 hover:border-blue-300
            active:scale-[0.97]
            transition-all
          "
        >
          <ArrowLeft className="h-4 w-4" />
          Quay lại
        </button>

        {/* ===== Job detail content ===== */}
        <JobDetailView jobId={id} />
      </div>
    </div>
  );
}
