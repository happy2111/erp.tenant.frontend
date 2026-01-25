import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import { toast } from 'sonner';
import { useTenantAuthStore } from '@/store/tenant-auth.store';
import { toErrorMessage } from "@/lib/utils";

interface CustomAxiosRequestConfig extends InternalAxiosRequestConfig {
  _retry?: boolean;
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue: any[] = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use((config) => {
  const apiKey = useTenantAuthStore.getState().apiKey;

  if (apiKey) {
    config.headers['x-tenant-key'] = apiKey;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError<any>) => {
    const originalRequest = error.config as CustomAxiosRequestConfig;

    // 1. Если ошибка не 401 или это запрос на логин/рефреш — просто выводим тост
    if (
      !error.response ||
      error.response.status !== 401 ||
      originalRequest.url?.includes("/tenant-auth/login") ||
      originalRequest.url?.includes("/tenant-auth/refresh")
    ) {
      const msg = toErrorMessage(error.response?.data);
      if (!originalRequest.url?.includes("/tenant-auth/refresh")) {
        toast.error(msg);
      }
      return Promise.reject(error);
    }

    // 2. Если уже идет процесс обновления токена
    if (originalRequest._retry) {
      return Promise.reject(error);
    }

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then(() => api(originalRequest))
        .catch((err) => Promise.reject(err));
    }

    // 3. Начинаем процесс обновления
    originalRequest._retry = true;
    isRefreshing = true;

    try {
      // ИСПОЛЬЗУЕМ ПРАВИЛЬНЫЙ СТОР (из нового проекта)
      const ok = await useTenantAuthStore.getState().refresh();

      if (!ok) throw new Error("Refresh failed");

      processQueue(null);
      return api(originalRequest);
    } catch (err) {
      processQueue(err, null);
      useTenantAuthStore.getState().logout();
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  }
);

export default api;