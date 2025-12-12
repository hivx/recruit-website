// src/services/preferenceService.ts
import { api, isAxiosError } from "@/api";
import type {
  RecruiterPreferenceRaw,
  RecruiterPreference,
  RecruiterPreferenceUpsertRequest,
} from "@/types";
import { mapRecruiterPreferenceRaw } from "@/types";

/** =============================
 * GET /api/preferences/recruiter
 ============================== */
export async function getRecruiterPreferences(): Promise<RecruiterPreference> {
  try {
    const res = await api.get<RecruiterPreferenceRaw | Record<string, never>>(
      "/api/preferences/recruiter",
    );

    // BE có thể trả {}
    if (!res.data || Object.keys(res.data).length === 0) {
      return {
        userId: "",
        desiredLocation: null,
        desiredSalaryAvg: null,
        desiredTags: [],
        requiredSkills: [],
        updatedAt: "",
      };
    }

    return mapRecruiterPreferenceRaw(res.data as RecruiterPreferenceRaw);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when fetching recruiter preferences");
  }
}

/** =============================
 * PUT /api/preferences/recruiter
 ============================== */
export async function updateRecruiterPreferences(
  payload: RecruiterPreferenceUpsertRequest,
): Promise<RecruiterPreference> {
  try {
    const res = await api.put<{ data: RecruiterPreferenceRaw }>(
      "/api/preferences/recruiter",
      payload,
    );

    return mapRecruiterPreferenceRaw(res.data.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error while updating recruiter preferences");
  }
}
