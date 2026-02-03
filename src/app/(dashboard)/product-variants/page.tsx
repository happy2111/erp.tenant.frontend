import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  ProductVariantsCrud
} from "@/features/product-variants/ProductVariantsCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <ProductVariantsCrud/>
    </ProtectedRoute>
  )
}
export default Page
