// src/services/tagService.ts
import { api } from "@/api";
import type { Tag, GetTag, PopularTag } from "@/types";

export async function getAllTags(): Promise<Tag[]> {
  const res = await api.get<GetTag[]>("api/jobs/tags");
  return res.data;
}

// GET /tags/popular
export async function getPopularTags(): Promise<PopularTag[]> {
  const res = await api.get<PopularTag[]>("api/jobs/popular-tags");
  return res.data ?? [];
}
