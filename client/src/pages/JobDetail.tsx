import { useParams } from "react-router-dom";
import { useJobById } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";
import { ErrorBox, Loader } from "@/components";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data: job, isLoading, isError, error, refetch } = useJobById(id!);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorBox message={getAxiosErrorMessage(error)} onRetry={refetch} />;
  if (!job) return <p className="p-4">Không tìm thấy công việc!</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{job.title}</h1>
      <p className="text-lg text-gray-600">{job.company}</p>
      <p className="text-sm text-gray-500">
        Posted by {job.createdByName} • {new Date(job.createdAt).toLocaleDateString()}
      </p>

      {job.location && <p><strong>Location:</strong> {job.location}</p>}
      {job.salary && <p><strong>Salary:</strong> {job.salary}</p>}
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
    </div>
  );
}
