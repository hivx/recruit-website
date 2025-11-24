import axios from "axios";
import { toast } from "sonner";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  timeout: 10000,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error instanceof Error ? error : new Error(error))
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const msg =
      error?.response?.data?.message ||
      error?.message ||
      "Đã có lỗi khi gọi API";
    toast.error(msg);
    return Promise.reject(error instanceof Error ? error : new Error(msg));
  }
);
