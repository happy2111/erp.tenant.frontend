import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {SalesCrud} from "@/features/sales/SalesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <SalesCrud/>
    </ProtectedRoute>
  )
}
export default Page
