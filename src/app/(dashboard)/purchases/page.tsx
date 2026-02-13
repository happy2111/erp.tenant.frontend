import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {PurchasesCrud} from "@/features/purchases/PurchasesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <PurchasesCrud/>
    </ProtectedRoute>
  )
}
export default Page
