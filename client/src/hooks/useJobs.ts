// src/hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import { getJobs, getJobById } from '@/services';
import type { Job, PaginatedJobs } from '@/types';

export function useJobs(page = 1, limit = 10) {
  return useQuery<PaginatedJobs<Job>, Error>({
    queryKey: ["jobs", page, limit],
    queryFn: () => getJobs(page, limit),
  });
}

export function useJobById(id: number) {
  return useQuery<Job, Error>({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });
}
