import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {
  InstallmentDetailView
} from "@/components/installments/InstallmentDetailView";

const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;

  return (
    <ProtectedRoute>
      <InstallmentDetailView id={id} />
    </ProtectedRoute>
  )
}
export default Page
