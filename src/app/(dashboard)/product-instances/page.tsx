import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  ProductInstancesCrud
} from "@/features/product-instances/ProductInstancesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <ProductInstancesCrud/>
    </ProtectedRoute>

  )
}
export default Page
