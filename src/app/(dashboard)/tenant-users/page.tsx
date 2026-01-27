import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {TenantUserCrud} from "@/features/tenant-user/TenantUserCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <TenantUserCrud/>
    </ProtectedRoute>
  )
}
export default Page
