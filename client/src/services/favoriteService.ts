import { api } from "@/api";

export async function toggleFavorite(jobId: string) {
  const res = await api.post(`/api/users/favorite/${jobId}`);
  return res.data;
}
