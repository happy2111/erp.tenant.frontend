'use client';

import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  OrganizationCustomer,
  CreateOrgCustomerDto,
  UpdateOrgCustomerDto,
  CreateOrgCustomerSchema,
  UpdateOrgCustomerSchema
} from "@/schemas/org-customer.schema";
import { OrganizationCustomerService } from "@/services/org.customer.service";
import { organizationCustomerFields } from "./organization-customer-fields";
import { CrudDialog } from "@/components/crud/CrudDialog";
import { CrudForm } from "@/components/crud/CrudForm";
import { toast } from "sonner";

interface OrganizationCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Если передан, диалог работает в режиме редактирования */
  editItem?: OrganizationCustomer | null;
  /** Опциональный колбэк при успехе */
  onSuccess?: (data: OrganizationCustomer) => void;
}

export function OrganizationCustomerDialog({
                                             open,
                                             onOpenChange,
                                             editItem,
                                             onSuccess
                                           }: OrganizationCustomerDialogProps) {
  const queryClient = useQueryClient();

  // Мутация создания
  const createMutation = useMutation({
    mutationFn: OrganizationCustomerService.create,
    onSuccess: (newCustomer) => {
      queryClient.invalidateQueries({ queryKey: ["org-customers"] });
      toast.success("Клиент успешно создан");
      onSuccess?.(newCustomer);
      onOpenChange(false);
    },
  });

  // Мутация обновления
  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: UpdateOrgCustomerDto }) =>
      OrganizationCustomerService.update(id, dto),
    onSuccess: (updatedCustomer) => {
      queryClient.invalidateQueries({ queryKey: ["org-customers"] });
      toast.success("Данные обновлены");
      onSuccess?.(updatedCustomer);
      onOpenChange(false);
    },
  });

  const handleSubmit = async (values: any) => {
    if (editItem?.id) {
      await updateMutation.mutateAsync({ id: editItem.id, dto: values });
    } else {
      await createMutation.mutateAsync(values);
    }
  };

  return (
    <CrudDialog
      open={open}
      onOpenChange={onOpenChange}
      title={editItem ? "Редактировать клиента" : "Создать клиента"}
    >
      <CrudForm
        fields={organizationCustomerFields}
        schema={editItem ? UpdateOrgCustomerSchema : CreateOrgCustomerSchema}
        defaultValues={
          editItem
            ? { ...editItem }
            : { type: "CLIENT", isBlacklisted: false }
        }
        onSubmit={handleSubmit}
        // Можно добавить индикатор загрузки из мутаций
        // isLoading={createMutation.isPending || updateMutation.isPending}
      />
    </CrudDialog>
  );
}