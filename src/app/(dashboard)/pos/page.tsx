'use client'

import React from 'react'
import ProtectedRoute from "@/components/auth/protected-route";
import { PosCatalog } from "@/components/pos/Catalog";
import { CheckoutPanel } from "@/components/pos/CheckoutPanel";
import { PosHeader } from "@/components/pos/PosHeader";
import { useQueryClient } from "@tanstack/react-query";

const Page = () => {
  const queryClient = useQueryClient();

  const handleSaleComplete = () => {
    queryClient.invalidateQueries(['pos-variants']);
    queryClient.invalidateQueries(['pos-products']);
  };

  return (
    <ProtectedRoute>
      {/* h-screen вместо h-[90vh], чтобы на мобилках не было лишнего скролла страницы.
        overflow-hidden на родителе обязателен.
      */}
      <div className="flex flex-col h-screen overflow-hidden bg-background">
        <PosHeader />

        <main className="flex flex-1 overflow-hidden relative">
          {/* Каталог занимает всё пространство и скроллится сам */}
          <section className="flex-1 overflow-y-auto custom-scrollbar">
            <PosCatalog />
          </section>

          {/* CheckoutPanel на десктопе фиксирован справа */}
          <aside className="hidden lg:block border-l bg-card/10">
            <CheckoutPanel onSaleComplete={handleSaleComplete} />
          </aside>

          {/* Кнопка и Drawer для мобилок */}
          <div className="lg:hidden">
            <CheckoutPanel onSaleComplete={handleSaleComplete} />
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}

export default Page