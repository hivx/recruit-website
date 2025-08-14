import { useJobs } from "@/hooks/useJobs";

export function JobList() {
  const { data, isLoading, isError } = useJobs(1, 10);

  if (isLoading) return <p>Đang tải...</p>;
  if (isError) return <p>Đã có lỗi xẩy ra!</p>;

  if (!data?.data?.length) {
    return <p>Không tìm thấy công việc nào!</p>;
  }

  return (
    <ul className="space-y-4">
      {data.data.map((job) => (
        <li
          key={job._id}
          className="p-4 border rounded-lg shadow-sm hover:shadow-md transition"
        >
          <h2 className="text-lg font-semibold">{job.title}</h2>
          <p className="text-sm text-gray-500">{job.company}</p>
          <p className="text-sm text-gray-400">
            Posted by {job.createdByName} • {new Date(job.createdAt).toLocaleDateString()}
          </p>
        </li>
      ))}
    </ul>
  );
}
