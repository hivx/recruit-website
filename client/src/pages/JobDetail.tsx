import { useParams } from "react-router-dom";
import { useJobById } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";
import { ErrorBox, Loader } from "@/components";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const jobId = id ? Number(id) : undefined;
  const {
    data: job,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobById(jobId!);

  if (isLoading) return <Loader />;
  if (isError)
    return (
      <ErrorBox message={getAxiosErrorMessage(error)} onRetry={refetch} />
    );
  if (!job) return <p className="p-4">Không tìm thấy công việc!</p>;

  // Lương hiển thị
  let salaryText: string | null = null;
  if (job.salaryMin && job.salaryMax) {
    salaryText = `${job.salaryMin.toLocaleString()} - ${job.salaryMax.toLocaleString()} VND`;
  } else if (job.salaryMin) {
    salaryText = `${job.salaryMin.toLocaleString()} VND`;
  } else if (job.salaryMax) {
    salaryText = `${job.salaryMax.toLocaleString()} VND`;
  }

  // Xử lý ngày đăng
  let createdDateText = "N/A";
  if (job.createdAtFormatted) {
    createdDateText = job.createdAtFormatted;
  } else if (job.createdAt) {
    createdDateText = new Date(job.createdAt).toLocaleDateString();
  }

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-lg text-gray-600">{job.company}</p>
      <p className="text-sm text-gray-500">
        Được đăng bởi {job.createdByName} • {createdDateText}
      </p>

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
      {job.requirements && (
        <div>
          <strong>Requirements:</strong>
          <p>{job.requirements}</p>
        </div>
      )}
      {job.tags?.length > 0 && (
        <p>
          <strong>Tags:</strong> {job.tags.join(", ")}
        </p>
      )}

      {job.description && (
        <div>
          <strong>Description:</strong>
          <p>{job.description}</p>
        </div>
      )}

      {/* Yêu thích */}
      {job.isFavorite !== undefined && (
        <p className="text-sm text-gray-600">
          {job.isFavorite ? "⭐ Đã lưu vào danh sách yêu thích" : "☆ Chưa lưu"}
        </p>
      )}
    </div>
  );
}
