// src/utils/jobDate.ts
import { formatDateDMY } from "@/utils";
const SIX_MONTHS_MS = 1000 * 60 * 60 * 24 * 30 * 6;

export function getJobDates(createdAt?: string, updatedAt?: string) {
  return {
    postedDate: formatDateDMY(createdAt),
    updatedDate: formatDateDMY(updatedAt),
    isOutdated:
      updatedAt && Date.now() - new Date(updatedAt).getTime() > SIX_MONTHS_MS,
  };
}
