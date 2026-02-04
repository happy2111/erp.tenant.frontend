import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {KassasCrud} from "@/features/kassas/KassasCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <KassasCrud/>
    </ProtectedRoute>
  )
}
export default Page
