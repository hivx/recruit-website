// src/services/jobService.ts
import { api } from "@/api";       // dùng axios instance chung
import { normalizeJob } from "@/types";
import type { Job, Paginated } from "@/types";

export async function getJobs(
  page = 1,
  limit = 10
): Promise<Paginated<Job>> {
  const res = await api.get("/api/jobs", { params: { page, limit } });

  return {
    data: (res.data.jobs ?? []).map(normalizeJob),
    page: res.data.page ?? 1,
    limit: res.data.limit ?? limit,
    total: res.data.total ?? (res.data.jobs?.length ?? 0),
  };
}

export async function getJobById(id: string): Promise<Job> {
  const res = await api.get(`/api/jobs/${id}`);
  return normalizeJob(res.data);
}

export async function createJob(jobData: Partial<Job>): Promise<Job> {
  const res = await api.post("/api/jobs", jobData);
  return normalizeJob(res.data);
}

export async function updateJob(id: string, jobData: Partial<Job>): Promise<Job> {
  const res = await api.put(`/api/jobs/${id}`, jobData);
  return normalizeJob(res.data);
}

export async function deleteJob(id: string): Promise<void> {
  await api.delete(`/api/jobs/${id}`);
}
