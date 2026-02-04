import React from 'react'
import ProductVariantDetailPage
  from "@/components/product-variants/pages/ProductVariantDetailPage";
import ProtectedRoute from "@/components/auth/protected-route";

export default async function ConverToUser({ params }: { params: Promise<{ id: string }> }) {

  const {id} = await params;

  return (
    <ProtectedRoute>
      <ProductVariantDetailPage variantId={id}/>
    </ProtectedRoute>
  )
}
