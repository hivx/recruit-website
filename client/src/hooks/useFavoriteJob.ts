import { useAppNavigate } from "@/hooks";
import { toggleFavorite } from "@/services";
import { useUserStore, useFavoriteStore } from "@/stores";

export function useFavoriteJob(jobId: number) {
  const navigate = useAppNavigate();

  const token = useUserStore((s) => s.token);
  const favorites = useFavoriteStore((s) => s.favorites);
  const toggleFav = useFavoriteStore((s) => s.toggle);

  const isFavorite = favorites.has(jobId);

  const toggle = async () => {
    if (!token) {
      navigate("/login");
      return;
    }

    // Optimistic UI
    toggleFav(jobId);

    try {
      await toggleFavorite(String(jobId));
    } catch {
      toggleFav(jobId); // rollback
    }
  };

  return {
    isFavorite,
    toggle,
  };
}
