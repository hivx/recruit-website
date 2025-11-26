import axios, { AxiosError } from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL as string) || "http://localhost:5000",
  timeout: 10000,
});

// ----- REQUEST INTERCEPTOR -----
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: unknown) => {
    const normalized =
      error instanceof Error ? error : new Error("Request error");
    return Promise.reject(normalized);
  },
);

// ----- RESPONSE INTERCEPTOR -----
api.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    let msg = "Đã có lỗi khi gọi API";

    if (axios.isAxiosError(error)) {
      const axiosErr = error as AxiosError<{ message?: string }>;
      msg =
        axiosErr.response?.data?.message ??
        axiosErr.message ??
        "Đã có lỗi khi gọi API";
    } else if (error instanceof Error) {
      msg = error.message;
    }

    toast.error(msg);

    const normalized = error instanceof Error ? error : new Error(msg);

    return Promise.reject(normalized);
  },
);
