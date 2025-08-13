// /src/types/mappers.ts
import type { Job } from '@/types';

type RawJob = {
  _id: string | number;
  title: string;
  tags?: string[];
  company: string;
  location?: string;
  description?: string;
  salary?: string | number;
  requirements?: string;
  createdBy: string;
  createdByName: string;
  createdAt?: string | number;
  updatedAt?: string | number;
  isFavorite?: boolean;
};

export function normalizeJob(raw: RawJob): Job {
  return {
    _id: String(raw._id),
    title: String(raw.title),
    tags: Array.isArray(raw.tags) ? raw.tags.map(String) : [],
    company: String(raw.company),
    location: raw.location ? String(raw.location) : undefined,
    description: raw.description ? String(raw.description) : undefined,
    salary: raw.salary ? String(raw.salary) : undefined,
    requirements: raw.requirements ? String(raw.requirements) : undefined,
    createdBy: String(raw.createdBy),
    createdByName: String(raw.createdByName),
    createdAt: String(raw.createdAt || ''),
    updatedAt: String(raw.updatedAt || ''),
    isFavorite: typeof raw.isFavorite === 'boolean' ? raw.isFavorite : undefined,
  };
}
