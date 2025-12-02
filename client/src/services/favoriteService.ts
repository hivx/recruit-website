import { api } from "@/api";

export async function toggleFavorite(jobId: string): Promise<unknown> {
  const res = await api.post(`/api/users/favorite/${jobId}`);
  return res.data;
}
