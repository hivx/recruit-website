import type { JobRaw } from "@/types";

export interface JobListResponse {
  jobs: JobRaw[];
  total: number;
  page: number;
  totalPages: number;
}
