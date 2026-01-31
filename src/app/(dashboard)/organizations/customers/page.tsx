import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  OrganizationCustomerCrud
} from "@/features/org-customer/OrganizationCustomer";

const Page = () => {
  return (
    <ProtectedRoute>
      <OrganizationCustomerCrud />
    </ProtectedRoute>
  )
}
export default Page
