import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import {AttributeDetails} from "@/features/attributes/AttributeDetails";

export default async function Page({params}: {params: Promise<{id: string}>}){
  const {id} = await params;
  return (
    <ProtectedRoute>
      <AttributeDetails attributeId={id}/>
    </ProtectedRoute>
  )
}
