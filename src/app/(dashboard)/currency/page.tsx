import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {CurrencyCrud} from "@/features/currency/CurrencyCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <CurrencyCrud/>
    </ProtectedRoute>
  )
}
export default Page
