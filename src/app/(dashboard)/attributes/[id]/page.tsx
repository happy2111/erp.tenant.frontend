import React, { Suspense } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { AttributeDetails } from "@/features/attributes/AttributeDetails";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return (
    <ProtectedRoute>
      <Suspense
        fallback={
          <div className="p-6 text-muted-foreground">Yuklanmoqda...</div>
        }
      >
        <AttributeDetails attributeId={id} />
      </Suspense>
    </ProtectedRoute>
  );
}
