'use client';
import { useOrganizationCustomerStore } from '@/store/organization.customer.store';
import { useEffect, useState } from 'react';
import { OrganizationCustomerFilterRequest } from '@/schemas/organization.customer.schema';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Loader2, Trash2, Edit } from 'lucide-react';
import {
  CreateCustomerModal
} from "@/components/organization/customers/CreateCustomerModal";

export default function CustomersPage() {
  const {
    customers,
    filterCustomers,
    filterData,
    loading,
    deleteCustomer
  } = useOrganizationCustomerStore();

  // Состояние для пагинации/фильтрации
  const [filter, setFilter] = useState<OrganizationCustomerFilterRequest>({
    page: 1,
    limit: 10,
  });

  // Загрузка данных при монтировании и изменении фильтра
  useEffect(() => {
    filterCustomers(filter);
  }, [filter, filterCustomers]);

  const handleDelete = async (id: string) => {
    const success = await deleteCustomer(id);
    if (success) {
      // После удаления, обновляем текущий список, чтобы пагинация была корректной
      filterCustomers(filter);
    }
  };

  const handlePageChange = (newPage: number) => {
    setFilter((prev: any) => ({ ...prev, page: newPage }));
  };

  return (
    <div className="flex flex-col gap-4 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Управление Клиентами</h1>
        <CreateCustomerModal />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Список Клиентов</CardTitle>
          <CardDescription>
            Все клиенты ваших организаций. Всего: {filterData?.total ?? 0}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading && (
            <div className="flex justify-center items-center h-40">
              <Loader2 className="mr-2 h-8 w-8 animate-spin" />
              <span className="text-lg">Загрузка...</span>
            </div>
          )}

          {!loading && customers.length > 0 && (
            <>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Имя</TableHead>
                    <TableHead>Телефон</TableHead>
                    <TableHead>Тип</TableHead>
                    <TableHead>User ID</TableHead>
                    <TableHead>Blacklisted</TableHead>
                    <TableHead className="text-right">Действия</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer: any) => (
                    <TableRow key={customer.id}>
                      <TableCell>{customer.firstName} {customer.lastName}</TableCell>
                      <TableCell>{customer.phone}</TableCell>
                      <TableCell>{customer.type}</TableCell>
                      <TableCell>{customer.userId ? 'Да' : 'Нет'}</TableCell>
                      <TableCell>{customer.isBlacklisted ? 'Да' : 'Нет'}</TableCell>
                      <TableCell className="text-right space-x-2">
                        {/* <Button variant="outline" size="icon" onClick={() => toast.info('Редактирование в разработке')}>
                            <Edit className="h-4 w-4" />
                        </Button> */}
                        <Button variant="destructive" size="icon" onClick={() => handleDelete(customer.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {/* Пагинация (простая реализация) */}
              <div className="flex justify-end items-center space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filter.page - 1)}
                  disabled={filter.page <= 1}
                >
                  Назад
                </Button>
                <span>Страница {filterData?.page} из {Math.ceil((filterData?.total ?? 0) / (filterData?.limit ?? 10))}</span>
                <Button
                  variant="outline"
                  onClick={() => handlePageChange(filter.page + 1)}
                  disabled={filter.page * (filterData?.limit ?? 10) >= (filterData?.total ?? 0)}
                >
                  Вперед
                </Button>
              </div>
            </>
          )}

          {!loading && customers.length === 0 && (
            <div className="text-center py-10 text-muted-foreground">
              Нет клиентов, соответствующих фильтру.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}