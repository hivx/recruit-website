import { useQuery } from "@tanstack/react-query";
import { getFavoriteJobs } from "@/services";
import type { FavoriteJobListResponse } from "@/types";

export function useFavoriteJobs() {
  return useQuery<FavoriteJobListResponse>({
    queryKey: ["favorite-jobs"],
    queryFn: getFavoriteJobs,

    staleTime: 1000 * 60 * 3, // 3 phút không refetch
    gcTime: 1000 * 60 * 10, // giữ cache trong 10 phút (v5)

    retry: 1,
    refetchOnWindowFocus: false,
    enabled: true,
  });
}
