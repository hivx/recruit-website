// src/services/skillService.ts
import { isAxiosError } from "axios";
import { api } from "@/api/api";
import type {
  MySkillListResponseRaw,
  MySkillListResponse,
  SkillPayload,
  AllSkillListResponseRaw,
  AllSkillListResponse,
} from "@/types";
import { mapMySkillListRaw, mapAllSkillListRaw } from "@/types";

/** Lấy danh sách kỹ năng của chính user */
export async function getMySkills(): Promise<MySkillListResponse> {
  try {
    const res = await api.get<MySkillListResponseRaw>("/api/skills/my-skills");
    return mapMySkillListRaw(res.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when fetching my skills");
  }
}

/** Upsert (thêm hoặc cập nhật) kỹ năng */
export async function upsertMySkill(
  payload: SkillPayload,
): Promise<{ message: string }> {
  try {
    const res = await api.put<{ message: string }>(
      "/api/skills/my-skills",
      payload,
    );
    return res.data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when upserting skill");
  }
}

/** Xóa kỹ năng khỏi hồ sơ của user */
export async function deleteMySkill(
  skillId: string,
): Promise<{ message: string }> {
  try {
    const res = await api.delete<{ message: string }>(
      `/api/skills/my-skills/${skillId}`,
    );
    return res.data;
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when deleting skill");
  }
}

/** Danh sách skill công khai (có tìm kiếm) */
export async function getAllSkills(q?: string): Promise<AllSkillListResponse> {
  try {
    const res = await api.get<AllSkillListResponseRaw>("/api/skills", {
      params: q ? { q } : undefined,
    });

    return mapAllSkillListRaw(res.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when fetching all skills");
  }
}
