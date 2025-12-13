'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { z } from 'zod';
// Используем CustomerTypeEnum из схем (предполагая, что он импортирован правильно)
import { CustomerTypeEnum, CreateOrgCustomerRequest } from '@/schemas/organization.customer.schema';
import { useOrganizationCustomerStore } from '@/store/organization.customer.store';
import { useOrganizationStore } from '@/store/organization.store';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { ScrollArea } from '@/components/ui/scroll-area';
import { toast } from 'sonner';

// --- Схема для формы (объединяет DTO и поля формы) ---
// Используем DTO как базу и расширяем его для нужд формы (selectedOrganizationIds)
const CustomerCreationFormSchema = z.object({
  organizationId: z.string().uuid("Organization ID is required"),
  firstName: z.string().min(1, "Имя обязательно").max(255),
  lastName: z.string().min(1, "Фамилия обязательна").max(255),

  // Если API позволяет отправлять null/undefined, используем .optional().nullable()
  patronymic: z.string().max(255).optional().nullable(),

  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Неверный формат номера телефона"),
  type: CustomerTypeEnum,

  // FIX: isBlacklisted. Обязательно на выходе, но опционально на входе в useForm.
  // Если убрать .optional(), `zodResolver` может конфликтовать с `react-hook-form`.
  isBlacklisted: z.boolean().optional().default(false),

  // Поле, не входящее в DTO, только для формы
  selectedOrganizationIds: z.array(z.string().uuid()).optional(),
});

type CustomerFormValues = z.infer<typeof CustomerCreationFormSchema>;

interface CreateCustomerFormProps {
  onSuccess: () => void;
}

export function CreateCustomerForm({ onSuccess }: CreateCustomerFormProps) {
  const { createCustomer, loading: isCreating } = useOrganizationCustomerStore();
  const { allOrganizations, fetchAllOrganizations } = useOrganizationStore();

  // ИСПОЛЬЗУЕМ ЯВНО CustomerFormValues В useForm
  const form = useForm<CustomerFormValues>({
    resolver: zodResolver(CustomerCreationFormSchema),
    defaultValues: {
      organizationId: '',
      firstName: '',
      lastName: '',
      patronymic: undefined, // Явно undefined или null
      phone: '',
      type: CustomerTypeEnum.enum.CLIENT,
      isBlacklisted: false,
      selectedOrganizationIds: [],
    },
  });

  // 1. Загрузка всех организаций
  React.useEffect(() => {
    if (allOrganizations.length === 0) {
      fetchAllOrganizations();
    }
  }, [allOrganizations.length, fetchAllOrganizations]);

  // 2. Установка основной организации по умолчанию
  React.useEffect(() => {
    if (allOrganizations.length > 0 && !form.getValues('organizationId')) {
      form.setValue('organizationId', allOrganizations[0].id);
    }
  }, [allOrganizations, form]);


  // onSubmit принимает data ТИПА CustomerFormValues
  const onSubmit = async (data: CustomerFormValues) => {
    const { selectedOrganizationIds, ...customerData } = data;

    // Подготовка DTO для API
    const customerDto: CreateOrgCustomerRequest = {
      organizationId: customerData.organizationId,
      firstName: customerData.firstName,
      lastName: customerData.lastName,
      patronymic: customerData.patronymic,
      phone: customerData.phone,
      type: customerData.type,
      isBlacklisted: customerData.isBlacklisted,
      // userId: undefined // поле userId отсутствует в форме, но присутствует в DTO.
    };

    // Определяем все организации, в которые нужно добавить клиента
    const allOrgIds = [customerData.organizationId, ...(selectedOrganizationIds || [])].filter(
      (id, index, self) => self.indexOf(id) === index // Уникальные ID
    );

    let successCount = 0;

    for (const orgId of allOrgIds) {
      // Клонируем DTO, меняя только organizationId
      const createdCustomer = await createCustomer({ ...customerDto, organizationId: orgId });
      if (createdCustomer) {
        successCount++;
      }
    }

    if (successCount > 0) {
      toast.success(`Клиент успешно добавлен в ${successCount} организацию(и).`);
      // Вызываем onSuccess только после всех попыток создания
      onSuccess();
    } else {
      toast.error("Не удалось добавить клиента ни в одну организацию.");
    }
  };

  return (
    // Form и FormField используют тип, унаследованный от useForm<CustomerFormValues>
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* ... (остальные поля формы) ... */}

        {/* Имя, Фамилия */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Имя</FormLabel>
                <FormControl>
                  <Input placeholder="Имя" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Фамилия</FormLabel>
                <FormControl>
                  <Input placeholder="Фамилия" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Телефон, Тип */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Телефон</FormLabel>
                <FormControl>
                  <Input placeholder="+998xxxxxxxxx" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Тип клиента</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите тип" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {/* CustomerTypeEnum.enum должен быть доступен */}
                    {Object.values(CustomerTypeEnum.enum).map((type) => (
                      <SelectItem key={type} value={type}>
                        {type}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Основная Организация и Чекбокс Blacklisted */}
        <div className="grid grid-cols-3 gap-4 items-end">
          <FormField
            control={form.control}
            name="organizationId"
            render={({ field }) => (
              <FormItem className="col-span-2">
                <FormLabel>Основная Организация (Обязательно)</FormLabel>
                <Select onValueChange={field.onChange} value={field.value} disabled={allOrganizations.length === 0}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Выберите основную организацию" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {allOrganizations.map((org) => (
                      <SelectItem key={org.id} value={org.id}>
                        {org.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="isBlacklisted"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center space-x-3 space-y-0 pb-1">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    В черном списке
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        {/* Выбор Дополнительных Организаций (Чекбоксы) */}
        {allOrganizations.length > 0 && (
          <FormField
            control={form.control}
            name="selectedOrganizationIds"
            render={() => (
              <FormItem>
                <FormLabel className="text-base">
                  Добавить в дополнительные организации
                </FormLabel>
                <ScrollArea className="h-40 w-full rounded-md border p-4">
                  {allOrganizations
                    .filter(org => org.id !== form.watch('organizationId')) // Исключаем основную
                    .map((org) => (
                      <FormField
                        key={org.id}
                        control={form.control}
                        name="selectedOrganizationIds"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={org.id}
                              className="flex flex-row items-start space-x-3 space-y-0 py-1"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(org.id)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...(field.value || []), org.id])
                                      : field.onChange(
                                        field.value?.filter(
                                          (value) => value !== org.id
                                        )
                                      );
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {org.name}
                              </FormLabel>
                            </FormItem>
                          );
                        }}
                      />
                    ))}
                </ScrollArea>
                <FormMessage />
              </FormItem>
            )}
          />
        )}


        <Button type="submit" disabled={isCreating || allOrganizations.length === 0} className="w-full">
          {isCreating ? 'Создание...' : 'Создать Клиента'}
        </Button>
      </form>
    </Form>
  );
}