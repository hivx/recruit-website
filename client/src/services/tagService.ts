import { api } from "@/api";
import type { Tag } from "@/types";

export interface GetTag {
  id: number;
  name: string;
  jobCount: number;
}

export interface PopularTag {
  tagId: number; // tagId
  tagName: string; // tagName
  count: number;
}

export async function getAllTags(): Promise<Tag[]> {
  const res = await api.get<GetTag[]>("api/jobs/tags");
  return res.data;
}

// GET /tags/popular
export async function getPopularTags(): Promise<PopularTag[]> {
  const res = await api.get<PopularTag[]>("api/jobs/popular-tags");
  return res.data ?? [];
}
