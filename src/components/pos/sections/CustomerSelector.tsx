'use client'

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { OrganizationCustomerService } from '@/services/org.customer.service';
import { usePosStore } from '@/store/use-pos-store';
import {
  Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger, DrawerClose
} from '@/components/ui/drawer';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, User, X, UserPlus, CheckCircle2 } from 'lucide-react';
import { useDebounce } from 'use-debounce';

export function CustomerSelector() {
  const { customerId, setCustomer } = usePosStore();
  const [search, setSearch] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [debouncedSearch] = useDebounce(search, 500);

  const { data, isLoading } = useQuery({
    queryKey: ['pos-customers', debouncedSearch],
    queryFn: () => OrganizationCustomerService.getAllAdmin({
      search: debouncedSearch,
      limit: 10,
    }),
    enabled: isOpen,
  });

  // Получаем данные выбранного клиента для отображения в Header
  const selectedCustomer = data?.items.find(c => c.id === customerId);

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button
          variant="outline"
          className="h-10 rounded-xl px-4 border-none bg-muted/50 flex items-center gap-2 hover:bg-muted"
        >
          <User className="size-4 opacity-50" />
          <div className="flex flex-col items-start leading-tight">
            <span className="text-[10px] uppercase font-bold opacity-50">Клиент</span>
            <span className="text-sm font-bold max-w-[120px] truncate">
              {selectedCustomer ? `${selectedCustomer.firstName} ${selectedCustomer.lastName}` : 'Выбрать клиента'}
            </span>
          </div>
        </Button>
      </DrawerTrigger>

      <DrawerContent className="h-[80vh]">
        <div className="mx-auto w-full max-w-md px-4">
          <DrawerHeader>
            <DrawerTitle className="text-center text-2xl font-black">Поиск клиента</DrawerTitle>
          </DrawerHeader>

          <div className="relative mt-4">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 opacity-40" />
            <Input
              placeholder="Имя, фамилия или телефон..."
              className="pl-10 h-12 rounded-2xl bg-muted border-none"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              autoFocus
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 opacity-40 hover:opacity-100"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="mt-6 space-y-2 h-[50vh] overflow-y-auto">
            {isLoading ? (
              <div className="text-center py-10 opacity-50">Загрузка...</div>
            ) : data?.items.length ? (
              data.items.map((customer) => (
                <button
                  key={customer.id}
                  onClick={() => {
                    setCustomer(customer.id);
                    setIsOpen(false);
                  }}
                  className={`w-full flex items-center justify-between p-4 rounded-2xl border transition-all ${
                    customerId === customer.id
                      ? 'border-primary bg-primary/5'
                      : 'border-transparent bg-muted/30 hover:bg-muted/60'
                  }`}
                >
                  <div className="flex flex-col items-start">
                    <span className="font-bold">{customer.firstName} {customer.lastName}</span>
                    <span className="text-xs opacity-50">{customer.phone}</span>
                  </div>
                  {customerId === customer.id ? (
                    <CheckCircle2 className="size-5 text-primary" />
                  ) : (
                    <div className="size-5 rounded-full border border-primary/20" />
                  )}
                </button>
              ))
            ) : (
              <div className="text-center py-10">
                <p className="opacity-50">Клиент не найден</p>
                <Button variant="link" className="mt-2 text-primary">
                  <UserPlus className="mr-2 size-4" /> Добавить нового
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 pb-8">
            <Button
              variant="destructive"
              className="w-full h-12 rounded-2xl font-bold"
              onClick={() => {
                setCustomer(null);
                setIsOpen(false);
              }}
            >
              Сбросить выбор
            </Button>
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}