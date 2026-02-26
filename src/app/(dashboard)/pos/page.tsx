'use client'

import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import { PosCatalog } from "@/components/pos/sections/Catalog";
import { CheckoutPanel } from "@/components/pos/sections/CheckoutPanel";
import { PosHeader } from "@/components/pos/sections/PosHeader";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const queryClient = useQueryClient();

  const handleSaleComplete = () => {
    queryClient.invalidateQueries({ queryKey: ['pos-variants'] });
    queryClient.invalidateQueries({ queryKey: ['pos-products'] });
  };

  return (
    <ProtectedRoute>
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <PosHeader />

        <main className="flex flex-1 overflow-hidden relative">
          <section className="flex-1 overflow-y-auto custom-scrollbar">
            <PosCatalog />
          </section>

          <aside className="hidden lg:block border-l bg-card/10">
            <CheckoutPanel onSaleComplete={handleSaleComplete} />
          </aside>

          <div className="lg:hidden overflow-x-scroll h-[80vh]">
            <CheckoutPanel onSaleComplete={handleSaleComplete} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Page