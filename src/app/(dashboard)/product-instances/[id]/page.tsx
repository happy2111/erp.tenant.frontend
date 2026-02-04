import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import ProductInstanceDetailPage from "@/components/product-instances/pages/Detail";

const Page = async ({params}: {params: Promise<{id: string}>}) => {
  const {id} = await params;

  return (
    <ProtectedRoute>
      <ProductInstanceDetailPage id={id}/>
    </ProtectedRoute>
    )
}
export default Page
