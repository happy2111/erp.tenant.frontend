import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  KassaTransfersCrud
} from "@/features/kassa-transfers/KassaTransfersCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <KassaTransfersCrud/>
    </ProtectedRoute>
  )

}
export default Page
