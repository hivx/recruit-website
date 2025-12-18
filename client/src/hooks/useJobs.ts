// src/hooks/useJobs.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getJobs,
  getJobById,
  getMyJobs,
  createJob,
  updateJob,
  deleteJob,
  approveJob,
  rejectJob,
} from "@/services";
import type {
  Job,
  PaginatedJobs,
  JobSearchQuery,
  JobDetail,
  JobCreatePayload,
  ApproveJobResponse,
  RejectJobResponse,
} from "@/types";
import { Toast, getAxiosErrorMessage } from "@/utils";

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
      Toast.success("Tạo tin tuyển dụng thành công!");
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
    onError: (err) => {
      Toast.error(getAxiosErrorMessage(err));
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
      Toast.success("Cập nhật thành công!");
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
    onError: (err) => {
      Toast.error(getAxiosErrorMessage(err));
    },
  });
}

//* Hook: Xóa job */
export function useDeleteJob() {
  const queryClient = useQueryClient();

  return useMutation<boolean, Error, string>({
    mutationFn: (jobId) => deleteJob(jobId),

    onSuccess: (success, jobId) => {
      Toast.success("Xóa tin tuyển dụng thành công!");
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
    onError: (err) => {
      Toast.error(getAxiosErrorMessage(err));
    },
  });
}

interface ApproveJobInput {
  jobId: string;
}

// Hook: ADMIN duyệt job
export function useApproveJob() {
  const queryClient = useQueryClient();

  return useMutation<ApproveJobResponse | null, Error, ApproveJobInput>({
    mutationFn: ({ jobId }) => approveJob(jobId),

    onSuccess: (res, { jobId }) => {
      if (!res) {
        Toast.error("Duyệt tin thất bại!");
        return;
      }

      Toast.success("Đã duyệt tin tuyển dụng!");

      // Update job detail cache nếu có
      queryClient.setQueryData(["job", jobId], (old: JobDetail | undefined) =>
        old
          ? {
              ...old,
              approval: {
                ...old.approval,
                status: "approved",
                auditedAt: res.auditedAt,
                reason: null,
              },
            }
          : old,
      );

      // Refresh lists
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },

    onError: (err) => {
      Toast.error(getAxiosErrorMessage(err));
    },
  });
}

interface RejectJobInput {
  jobId: string;
  reason: string;
}

// Hook: ADMIN từ chối job
export function useRejectJob() {
  const queryClient = useQueryClient();

  return useMutation<RejectJobResponse | null, Error, RejectJobInput>({
    mutationFn: ({ jobId, reason }) => rejectJob(jobId, { reason }),

    onSuccess: (res, { jobId }) => {
      if (!res) {
        Toast.error("Từ chối tin thất bại!");
        return;
      }

      Toast.success("Đã từ chối tin tuyển dụng!");

      // Update job detail cache nếu có
      queryClient.setQueryData(["job", jobId], (old: JobDetail | undefined) =>
        old
          ? {
              ...old,
              approval: {
                ...old.approval,
                status: "rejected",
                reason: res.reason,
                auditedAt: res.auditedAt,
              },
            }
          : old,
      );

      // Refresh lists
      void queryClient.invalidateQueries({ queryKey: ["jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["my-jobs"] });
      void queryClient.invalidateQueries({ queryKey: ["admin-jobs"] });
    },

    onError: (err) => {
      Toast.error(getAxiosErrorMessage(err));
    },
  });
}
