import type { AxiosRequestConfig } from 'axios';

export interface ApiConfig extends Omit<AxiosRequestConfig, 'headers'> {
  headers?: Record<string, string>;
}

export interface ApiResponse<T = unknown> {
  data: T;
  status: number;
  headers: Record<string, string>;
  error?: ApiError;
}

export interface ApiError {
  message: string;
  code?: string;
  details?: unknown;
}
