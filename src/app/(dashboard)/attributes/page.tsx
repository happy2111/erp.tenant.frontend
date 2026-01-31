import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {AttributesCrud} from "@/features/attributes/AttributesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <AttributesCrud/>
    </ProtectedRoute>
  )
}
export default Page
