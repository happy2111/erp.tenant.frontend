import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {BrandDetails} from "@/components/brands/BrandDetails";


export default async function ConverToUser({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return (

    <ProtectedRoute>
      <BrandDetails brandId={id}/>
    </ProtectedRoute>
  )
}
