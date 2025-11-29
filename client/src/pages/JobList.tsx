import { JobCard, Loader, ErrorBox } from "@/components";
import { useJobs } from "@/hooks";
import type { Job } from "@/types";
import { getAxiosErrorMessage } from "@/utils";

export function JobList() {
  const { data, isLoading, isError, error, refetch } = useJobs(1, 20);

  if (isLoading) {
    return <Loader size={18} />;
  }
  if (isError) {
    return (
      <ErrorBox
        message={getAxiosErrorMessage(error)}
        onRetry={() => void refetch()}
      />
    );
  }

  const jobList: Job[] = data?.jobs ?? [];

  return (
    <div className="p-6 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 animate-fade-in">
      {jobList.map((job) => (
        <JobCard key={job.id} job={job} />
      ))}
    </div>
  );
}
