'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationCustomerService } from '@/services/org.customer.service';
import { usePurchaseStore } from '@/store/use-purchase-store';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, User, X, CheckCircle2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';
import { cn } from '@/lib/utils';
import {CustomerType, CustomerTypeValues} from "@/schemas/org-customer.schema";

export function SupplierSelector() {
  const { supplierId, setSupplier } = usePurchaseStore();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [debouncedSearch] = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['suppliers', debouncedSearch],
    queryFn: () =>
      OrganizationCustomerService.getAllAdmin({
        search: debouncedSearch,
        type: CustomerTypeValues[1],
        limit: 20,
      }),
    enabled: open,
  });

  const selectedSupplier = data?.items.find((c) => c.id === supplierId);

  return (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-xl border-border/50 bg-background/50 backdrop-blur-sm px-4 flex items-center gap-2 hover:bg-muted"
        >
          <User className="size-4" />
          <span className="font-medium truncate max-w-[160px]">
            {selectedSupplier
              ? `${selectedSupplier.firstName || ''} ${selectedSupplier.lastName || ''}`
              : 'Поставщик'}
          </span>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[90vh]">
        <DrawerHeader className="border-b">
          <DrawerTitle className="text-center text-xl font-black">
            Выбор поставщика
          </DrawerTitle>
        </DrawerHeader>

        <div className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-50" />
            <Input
              placeholder="Поиск по имени или телефону..."
              className="pl-10 h-11 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                className="absolute right-3 top-1/2 -translate-y-1/2"
                onClick={() => setSearch('')}
              >
                <X className="size-4 opacity-60" />
              </button>
            )}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-6">
          {isLoading ? (
            <div className="text-center py-10 text-muted-foreground">
              Загрузка...
            </div>
          ) : data?.items.length ? (
            data.items.map((supplier) => (
              <button
                key={supplier.id}
                className={cn(
                  'w-full flex items-center justify-between p-4 rounded-xl mb-2 transition-all',
                  supplierId === supplier.id
                    ? 'bg-primary/10 border-primary/30 border'
                    : 'hover:bg-muted/50 border border-transparent'
                )}
                onClick={() => {
                  setSupplier(supplier.id);
                  setOpen(false);
                }}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">
                    {supplier.firstName} {supplier.lastName}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {supplier.phone || 'Нет телефона'}
                  </span>
                </div>

                {supplierId === supplier.id ? (
                  <CheckCircle2 className="size-5 text-primary" />
                ) : (
                  <div className="size-5 rounded-full border border-border" />
                )}
              </button>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              Поставщики не найдены
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}