import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {CategoriesCrud} from "@/features/categories/CategoriesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <CategoriesCrud/>
    </ProtectedRoute>
  )
}
export default Page
