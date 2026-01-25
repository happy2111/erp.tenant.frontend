import React from 'react'
import {OrganizationCrud} from "@/features/organization/OrganizationCrud";
import ProtectedRoute from "@/components/auth/protected-route";

const Page = () => {
  return (
    <ProtectedRoute
    allowedRoles={['OWNER', 'ADMIN']}
    >
      <OrganizationCrud/>
    </ProtectedRoute>
  )
}
export default Page
