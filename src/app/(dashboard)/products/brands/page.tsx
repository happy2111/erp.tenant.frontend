import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {BrandsCrud} from "@/features/brands/BrandsCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <BrandsCrud/>
    </ProtectedRoute>
  )
}
export default Page
