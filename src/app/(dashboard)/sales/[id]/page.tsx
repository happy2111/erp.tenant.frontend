import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {SaleDetailView} from "@/components/sales/SaleDetailView";

const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;
  return (
    <ProtectedRoute>
      <SaleDetailView id={id} />
    </ProtectedRoute>
  )
}
export default Page
