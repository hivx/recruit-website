// src/hooks/useJobs.ts
import { useQuery } from '@tanstack/react-query';
import { getJobs, getJobById } from '@/services';

export function useJobs(page = 1, limit = 10) {
  return useQuery({
    queryKey: ['jobs', page, limit],
    queryFn: () => getJobs(page, limit),
  });
}

export function useJobById(id: string) {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => getJobById(id),
    enabled: !!id,
  });
}
