import React from 'react'
import {CurrencyRatesCrud} from "@/features/currency-rates/ CurrencyRatesCrud";
import ProtectedRoute from "@/components/auth/protected-route";

const Page = () => {
  return (
    <ProtectedRoute>
      <CurrencyRatesCrud/>
    </ProtectedRoute>
  )
}
export default Page
