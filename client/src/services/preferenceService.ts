// src/services/preferenceService.ts
import { api, isAxiosError } from "@/api";
import type {
  RecruiterPreferenceRaw,
  RecruiterPreference,
  RecruiterPreferenceUpsertRequest,
  CareerPreferenceRaw,
  CareerPreference,
  CareerPreferenceUpsert,
} from "@/types";
import {
  mapRecruiterPreferenceRaw,
  mapCareerPreferenceRaw,
  mapCareerPreferenceUpsert,
} from "@/types";

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

/** =======================================================
 * GET /api/preferences/career-preference (Applicant)
 ======================================================= */
export async function getCareerPreference(): Promise<CareerPreference | null> {
  try {
    const res = await api.get<CareerPreferenceRaw | Record<string, never>>(
      "/api/preferences/career-preference",
    );

    // BE trả {} nếu chưa có preference
    if (!res.data || Object.keys(res.data).length === 0) {
      return null;
    }

    return mapCareerPreferenceRaw(res.data as CareerPreferenceRaw);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error when fetching career preference");
  }
}

/** =======================================================
 * PUT /api/preferences/career-preference (Applicant)
 ======================================================= */
export async function upsertCareerPreference(
  payload: CareerPreferenceUpsert,
): Promise<CareerPreference> {
  try {
    const rawPayload = mapCareerPreferenceUpsert(payload);

    const res = await api.put<{ data: CareerPreferenceRaw }>(
      "/api/preferences/career-preference",
      rawPayload,
    );

    return mapCareerPreferenceRaw(res.data.data);
  } catch (err: unknown) {
    if (isAxiosError(err)) {
      throw err;
    }
    throw new Error("Unexpected error while updating career preference");
  }
}
