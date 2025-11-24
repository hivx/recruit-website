// src/pages/JobList.tsx
import { useJobs } from "@/hooks";
import type { Job } from "@/types";
import { JobCard, Loader, ErrorBox } from "@/components";
import { getAxiosErrorMessage } from "@/utils";

export function JobList() {
  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useJobs(1, 10);

  if (isLoading) return <Loader />;

  if (isError)
    return (
      <ErrorBox
        message={getAxiosErrorMessage(error)}
        onRetry={refetch}
      />
    );

  // fallback tránh lỗi undefined
  const jobList: Job[] = data?.jobs ?? [];

  if (jobList.length === 0) {
    return <p className="p-4">Không có công việc nào.</p>;
  }

  return (
    <div className="space-y-4 p-6">
      {jobList.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
