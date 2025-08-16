import { useParams } from "react-router-dom";
import { useJobById } from "@/hooks";
import { getAxiosErrorMessage } from "@/utils";
import { ErrorBox, Loader } from "@/components";

export function JobDetail() {
  const { id } = useParams<{ id: string }>();
  const { data, isLoading, isError, error, refetch } = useJobById(id!);

  if (isLoading) return <Loader />;
  if (isError) return <ErrorBox message={getAxiosErrorMessage(error)} onRetry={refetch} />;
  if (!data) return <p className="p-4">Không tìm thấy công việc!</p>;

  return (
    <div className="p-6 space-y-4">
      <h1 className="text-2xl font-bold">{data.title}</h1>
      <p className="text-lg text-gray-600">{data.company}</p>
      <p className="text-sm text-gray-500">
        Posted by {data.createdByName} • {new Date(data.createdAt).toLocaleDateString()}
      </p>

      {data.location && <p><strong>Location:</strong> {data.location}</p>}
      {data.salary && <p><strong>Salary:</strong> {data.salary}</p>}
      {data.requirements && (
        <div>
          <strong>Requirements:</strong>
          <p>{data.requirements}</p>
        </div>
      )}
      {data.tags?.length > 0 && (
        <p>
          <strong>Tags:</strong> {data.tags.join(", ")}
        </p>
      )}

      {data.description && (
        <div>
          <strong>Description:</strong>
          <p>{data.description}</p>
        </div>
      )}
    </div>
  );
}
