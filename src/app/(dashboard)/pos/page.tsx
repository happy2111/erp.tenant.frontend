import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import { PosCatalog } from "@/components/pos/Catalog";
import { CheckoutPanel } from "@/components/pos/CheckoutPanel";
import { PosHeader } from "@/components/pos/PosHeader";

const Page = () => {
  return (
    <ProtectedRoute>
      <div className="flex flex-col h-[90vh] overflow-hidden">
        {/* HEADER */}
        <PosHeader />

        <main className="flex flex-1 overflow-hidden relative">
          <section className="flex-1 overflow-y-auto ">
            <PosCatalog />
          </section>

          <aside className="hidden lg:block">
            <CheckoutPanel />
          </aside>

          <div className="lg:hidden">
            <CheckoutPanel />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Page