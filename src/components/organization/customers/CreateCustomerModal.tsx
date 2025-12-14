'use client';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { CreateCustomerForm } from './CreateCustomerForm';
import React from 'react';

export function CreateCustomerModal() {
  const [open, setOpen] = React.useState(false);

  const handleSuccess = () => {
    // Закрываем модальное окно после успешного создания
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1">
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Добавить клиента
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Создать Нового Клиента</DialogTitle>
          <DialogDescription>
            Заполните данные клиента и выберите организации, в которые его нужно добавить.
          </DialogDescription>
        </DialogHeader>
        <CreateCustomerForm onSuccess={handleSuccess} />
      </DialogContent>
    </Dialog>
  );
}