import axios from "axios";
import { toast } from "sonner";
import {useTenantAuthStore} from "@/store/auth.store";

let isRefreshing = false;
let failedRequestsQueue = []; // Очередь запросов, ждущих обновления токена

// --- Вспомогательная функция для форматирования ошибки (без изменений) ---
function toErrorMessage(payload) {
  function asString(v) {
    if (v == null) return null;

    if (typeof v === "string") {
      return v.trim() || null;
    }

    if (Array.isArray(v)) {
      const parts = v
        .map((x) => asString(x))
        .filter(x => Boolean(x));
      return parts.length ? Array.from(new Set(parts)).join(", ") : null;
    }

    if (typeof v === "object") {
      const keysToTry = ["message", "error", "detail", "description", "statusText", "errorMessage"];
      for (const k of keysToTry) {
        const got = asString(v[k]);
        if (got) return got;
      }

      if (v.message && typeof v.message === "object") {
        const nested = asString(v.message.message) || asString(v.message.error);
        if (nested) return nested;
      }
    }

    try {
      return JSON.stringify(v);
    } catch (e) {
      // Игнорируем ошибки
    }

    return "Server error";
  }

  return asString(payload) || "Server error";
}

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'https://klab-server.onrender.com',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const { accessToken, apiKey } = useTenantAuthStore.getState();
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  if (apiKey) {
    config.headers['x-tenant-key'] = apiKey;
  }
  return config;
});

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config || {};

    const { refresh, logout } = useTenantAuthStore.getState();

    // Не пытаемся рефрешить, если запросившийся маршрут — это сам /auth/refresh
    // 💡 ПРЕДУПРЕЖДЕНИЕ: Замените "/auth/refresh" на актуальный маршрут, если он другой
    const isRefreshCall = originalRequest.url && originalRequest.url.includes("/auth/refresh");

    // Логика обработки 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry && !isRefreshCall) {
      originalRequest._retry = true; // Отмечаем запрос как попытку повтора

      if (isRefreshing) {
        // Если уже идет процесс обновления, ставим текущий запрос в очередь
        return new Promise((resolve, reject) => {
          failedRequestsQueue.push({ resolve, reject });
        })
          // После завершения рефреша, повторяем оригинальный запрос
          .then(() => api(originalRequest))
          .catch(err => Promise.reject(err));
      }

      isRefreshing = true;

      try {
        const ok = await refresh();

        if (!ok) {
          throw new Error("Refresh failed: Token or session is invalid.");
        }

        failedRequestsQueue.forEach(p => p.resolve());
        failedRequestsQueue = [];

        return api(originalRequest);
      } catch (refreshError) {
        failedRequestsQueue.forEach(p => p.reject(refreshError));
        failedRequestsQueue = [];

        logout();

        toast.error("Срок действия сессии истек. Пожалуйста, выполните вход заново.");

        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Обработка других ошибок (кроме 401)
    if (error.response?.status !== 401) {
      const msg = toErrorMessage(error.response?.data);
      // Не показываем ошибку, если это был вызов refresh (обработка в блоке catch выше)
      if (!isRefreshCall) {
        toast.error(msg);
      }
    }

    return Promise.reject(error);
  }
);

export default api;