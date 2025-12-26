// src/hooks/useSkills.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getMySkills,
  getAllSkills,
  upsertMySkill,
  deleteMySkill,
} from "@/services";
import type { SkillPayload } from "@/types";

// Lấy danh sách kỹ năng của chính user
export function useMySkills() {
  return useQuery({
    queryKey: ["my-skills"],
    queryFn: getMySkills,
    staleTime: 5 * 60 * 1000, // 5 phút: skill ít thay đổi
  });
}

//Lấy danh sách tất cả kỹ năng
export function useAllSkills(q?: string) {
  return useQuery({
    queryKey: ["skills", q],
    queryFn: () => getAllSkills(q),
    staleTime: 60 * 60 * 1000, // 1 giờ - danh sách này khá ổn định
  });
}

// Upsert (thêm hoặc cập nhật) kỹ năng
export function useUpsertSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: SkillPayload) => upsertMySkill(payload),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-skills"] });
    },
  });
}

// Xóa kỹ năng khỏi hồ sơ của user
export function useDeleteSkill() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => {
      if (!id) {
        throw new Error("Skill ID is required");
      }
      return deleteMySkill(id);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["my-skills"] });
    },
  });
}
