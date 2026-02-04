import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import CreateProductInstancePage from "@/components/product-instances/Create";

const Page = () => {
  return (
    <ProtectedRoute>
      <CreateProductInstancePage/>
    </ProtectedRoute>
  )
}
export default Page
