import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import CreateVariantPage
  from "@/components/product-variants/CreateProductVariantPage";

const Page = () => {
  return (
    <ProtectedRoute>
      <CreateVariantPage/>
    </ProtectedRoute>
    )
}
export default Page
