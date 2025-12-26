// src/utils/http.ts
import type { AxiosError } from "axios";
import type { ApiError } from "@/types";

function isAxiosError(err: unknown): err is AxiosError<ApiError> {
  return (err as AxiosError).isAxiosError === true;
}

export function getAxiosErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    return err.response?.data?.message || err.message || "Có lỗi xảy ra";
  }

  if (err instanceof Error) {
    return err.message;
  }

  return "Có lỗi không xác định";
}
