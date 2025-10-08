// src/pages/JobDetail.tsx
import { useParams } from "react-router-dom";
import { useJobById } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";
import { ErrorBox, Loader } from "@/components";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();

  //  ID là string (BE dùng BigInt/string)
  const {
    data: job,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobById(id);

  if (isLoading) return <Loader />;

  if (isError)
    return (
      <ErrorBox message={getAxiosErrorMessage(error)} onRetry={refetch} />
    );

  if (!job) return <p className="p-4">Không tìm thấy công việc!</p>;

  //  Lương hiển thị
  let salaryText: string | null = null;
  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  //  Ngày đăng
  const createdDateText =
    job.createdAtFormatted ||
    (job.createdAt
      ? new Date(job.createdAt).toLocaleDateString("vi-VN")
      : "N/A");

  return (
    <div className="p-6 space-y-4">
      {/* 🔹 Tiêu đề */}
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-lg text-gray-600">{job.company}</p>
      <p className="text-sm text-gray-500">
        Được đăng bởi {job.createdByName} • {createdDateText}
      </p>

      {/*  Location +  Salary */}
      {job.location && (
        <p>
          <strong>Location:</strong> {job.location}
        </p>
      )}
      {salaryText && (
        <p>
          <strong>Salary:</strong> {salaryText}
        </p>
      )}

      {/*  Requirements */}
      {job.requirements && (
        <div>
          <strong>Requirements:</strong>
          <p>{job.requirements}</p>
        </div>
      )}

      {/*  Tags */}
      {Array.isArray(job.tags) && job.tags.length > 0 && (
        <div>
          <strong>Tags:</strong>
          <div className="mt-1 flex flex-wrap gap-2">
            {job.tags.map((jt) => (
              <span
                key={jt.tagId ?? jt.tag?.id ?? `${job.id}-${Math.random()}`}
                className="px-2 py-1 bg-gray-100 text-gray-700 rounded-full text-xs"
              >
                {jt.tag?.name ?? "Không có tên tag"}
              </span>
            ))}
          </div>
        </div>
      )}

      {/*  Description */}
      {job.description && (
        <div>
          <strong>Description:</strong>
          <p>{job.description}</p>
        </div>
      )}

      {/*  Trạng thái yêu thích */}
      {job.isFavorite !== undefined && (
        <p className="text-sm text-gray-600">
          {job.isFavorite
            ? " Đã lưu vào danh sách yêu thích"
            : "☆ Chưa lưu"}
        </p>
      )}
    </div>
  );
}
