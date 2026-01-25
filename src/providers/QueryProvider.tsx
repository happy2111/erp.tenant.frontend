"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export default function QueryProvider({ children }: { children: React.ReactNode }) {
  // Инициализируем QueryClient внутри useState, чтобы он не пересоздавался при ререндерах
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        // Опционально: базовые настройки
        staleTime: 60 * 1000,
      },
    },
  }));

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}