import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import ConvertCustomerPage from "@/components/org-customers/pages/ConvertCustomerPage";


export default async function ConverToUser({ params }: { params: Promise<{ id: string }> }) {

  const { id } = await params;

  return (
    <ProtectedRoute>
      <ConvertCustomerPage id={id}/>
    </ProtectedRoute>
  )
}
