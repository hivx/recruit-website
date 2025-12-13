// src/hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getJobs,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
} from "@/services";
import type {
  Job,
  PaginatedJobs,
  JobSearchQuery,
  JobDetail,
  JobCreatePayload,
} from "@/types";

/** Hook: Lấy danh sách Job với phân trang + search/filter */
export function useJobs(page: number, limit: number, filter: JobSearchQuery) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit, JSON.stringify(filter)],
    queryFn: () => getJobs(page, limit, filter),
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [],
    }),
  });
}

export function useJobById(id?: string) {
  return useQuery<Job, Error>({
    queryKey: ["job", id],
    enabled: Boolean(id),
    queryFn: () => {
      if (!id) {
        throw new Error("Missing job id");
      }
      return getJobById(id);
    },
  });
}

/** Hook: Lấy danh sách Job thuộc về nhà tuyển dụng hiện tại */
export function useMyJobs(page: number, limit: number) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["my-jobs", page, limit],
    queryFn: () => getMyJobs(page, limit),
    placeholderData: (previousData) => previousData,
    select: (data) => ({
      ...data,
      jobs: data.jobs ?? [],
    }),
  });
}

//* Hook: Tạo job */
export function useCreateJob() {
  const queryClient = useQueryClient();

  return useMutation<JobDetail | null, Error, JobCreatePayload>({
    mutationFn: (data) => createJob(data),

    onSuccess: (job) => {
      if (!job) {
        return;
      }

      // Invalidate danh sách job
      void queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-jobs"],
      });

      // Cache detail job vừa tạo
      queryClient.setQueryData(["job", job.id], job);
    },
  });
}

interface UpdateJobInput {
  jobId: string;
  data: JobCreatePayload;
}
//* Hook: Sửa job */
export function useUpdateJob() {
  const queryClient = useQueryClient();

  return useMutation<JobDetail | null, Error, UpdateJobInput>({
    mutationFn: ({ jobId, data }) => updateJob(jobId, data),

    onSuccess: (job) => {
      if (!job) {
        return;
      }

      // Update cache job detail
      queryClient.setQueryData(["job", job.id], job);

      // Refresh lists
      void queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-jobs"],
      });
    },
  });
}

//* Hook: Xóa job */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (jobId) => deleteJob(jobId),

    onSuccess: (success, jobId) => {
      if (!success) {
        return;
      }

      // Xóa cache detail
      queryClient.removeQueries({
        queryKey: ["job", jobId],
      });

      // Refresh lists
      void queryClient.invalidateQueries({
        queryKey: ["jobs"],
      });

      void queryClient.invalidateQueries({
        queryKey: ["my-jobs"],
      });
    },
  });
}
