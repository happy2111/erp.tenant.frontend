import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import { BatchesPage } from "@/components/purchases/pages/BatchesPage";

// Статический сегмент объявлен рядом с [id] — в App Router он выигрывает,
// так что /purchases/batches не попадёт в карточку закупки
const Page = () => {
  return (
    <ProtectedRoute>
      <BatchesPage />
    </ProtectedRoute>
  )
}

export default Page
