// src/pages/JobDetail.tsx
import { useParams } from "react-router-dom";
import { ErrorBox, Loader } from "@/components";
import { useJobById } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();

  const {
    data: jobDetail,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobById(id);

  if (isLoading) {
    return <Loader size={18} />;
  }

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

  if (!jobDetail) {
    return <p className="p-4">Không tìm thấy công việc!</p>;
  }

  // Salary display
  let salaryText: string | null = null;
  if (jobDetail.salaryMin && jobDetail.salaryMax) {
    salaryText = `${jobDetail.salaryMin.toLocaleString()} - ${jobDetail.salaryMax.toLocaleString()} VND`;
  } else if (jobDetail.salaryMin) {
    salaryText = `${jobDetail.salaryMin.toLocaleString()} VND`;
  } else if (jobDetail.salaryMax) {
    salaryText = `${jobDetail.salaryMax.toLocaleString()} VND`;
  }

  // Created date
  const createdDateText = jobDetail.createdAt
    ? new Date(jobDetail.createdAt).toLocaleDateString("vi-VN")
    : "N/A";

  return (
    <div className="p-6 space-y-4">
      {/* Title */}
      <h1 className="text-2xl font-bold">{jobDetail.title}</h1>

      {/* Company */}
      <p className="text-lg text-gray-600">
        {jobDetail.company?.legalName ?? "Không rõ công ty"}
      </p>

      <p className="text-sm text-gray-500">Đăng ngày {createdDateText}</p>

      {/* Location + Salary */}
      {jobDetail.location && (
        <p>
          <strong>Location:</strong> {jobDetail.location}
        </p>
      )}
      {salaryText && (
        <p>
          <strong>Salary:</strong> {salaryText}
        </p>
      )}

      {/* Requirements */}
      {jobDetail.requirements && (
        <div>
          <strong>Requirements:</strong>
          <p>{jobDetail.requirements}</p>
        </div>
      )}

      {/* Tags */}
      {Array.isArray(jobDetail.tags) && jobDetail.tags.length > 0 && (
        <div>
          <strong>Tags:</strong>
          <div className="mt-1 flex flex-wrap gap-2">
            {jobDetail.tags.map((jt, index) => (
              <span
                key={`${jobDetail.id}-${jt.tagId}-${index}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {jt.tag?.name ?? "Không có tên tag"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Description */}
      {jobDetail.description && (
        <div>
          <strong>Description:</strong>
          <p>{jobDetail.description}</p>
        </div>
      )}
    </div>
  );
}
