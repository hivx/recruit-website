// Gói kiểu chung cho API
export interface Paginated<T> {
  data: T[];
  page: number;
  limit: number;
  total: number;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: Record<string, string>;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: ApiError;
}