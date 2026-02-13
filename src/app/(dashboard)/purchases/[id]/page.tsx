import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  PurchaseDetailView
} from "@/components/purchases/pages/PurchaseDetailView";

const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;
  return (
    <ProtectedRoute>
      <PurchaseDetailView id={id} />
    </ProtectedRoute>
  )
}
export default Page
