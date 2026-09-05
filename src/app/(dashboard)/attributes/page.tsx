import React, { Suspense } from "react";
import ProtectedRoute from "@/components/auth/protected-route";
import { AttributesCrud } from "@/features/attributes/AttributesCrud";

const Page = () => {
  return (
    <ProtectedRoute>
      <Suspense fallback={<div className="p-6 text-muted-foreground">Yuklanmoqda...</div>}>
        <AttributesCrud />
      </Suspense>
    </ProtectedRoute>
  );
};
export default Page;
