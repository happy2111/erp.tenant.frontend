import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {InstallmentsCrud} from "@/features/installments/InstallmentsCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <InstallmentsCrud/>
    </ProtectedRoute>
  )
}
export default Page
