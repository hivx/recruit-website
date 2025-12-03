import { useEffect } from "react";
import { useFavoriteStore } from "@/stores/favoriteStore";
import type { Job } from "@/types";

export function useSyncFavoritesFromJobs(jobs?: Job[]) {
  const setFromServer = useFavoriteStore((s) => s.setFromServer);

  useEffect(() => {
    if (!jobs || jobs.length === 0) {
      return;
    }

    const favoriteIds = jobs
      .filter((j) => j.isFavorite)
      .map((j) => Number(j.id));

    setFromServer(favoriteIds);
  }, [jobs, setFromServer]);
}
