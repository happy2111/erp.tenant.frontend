import api from '@/lib/axiosInstance';
import {
  CreateOrgCustomerDto,
  UpdateOrgCustomerDto,
  OrganizationCustomerFilterDto,
  ConvertCustomerToUserDto,
  OrganizationCustomer,
  OrganizationCustomerListSchema, OrganizationCustomerSchema,
} from '@/schemas/org-customer.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class OrganizationCustomerService {
  static async getAllAdmin(
    query: OrganizationCustomerFilterDto = {}
  ): Promise<{ items: OrganizationCustomer[]; total: number }> {
    const res = await api.get<ApiResponse<{ items: any[]; total: number }>>(
      '/organization-customer/admin/all',
      { params: query }
    );
    return OrganizationCustomerListSchema.parse(res.data.data);
  }


  static async getByIdAdmin(id: string): Promise<OrganizationCustomer> {
    const res = await api.get<ApiResponse<any>>(
      `/organization-customer/admin/${id}`
    );

    // Добавляем еще один .data, так как в ответе { data: { data: { ... } } }
    const customerData = res.data.data.data;

    return OrganizationCustomerSchema.parse(customerData);
  }

  static async create(
    dto: CreateOrgCustomerDto
  ): Promise<OrganizationCustomer> {
    const res = await api.post<ApiResponse<OrganizationCustomer>>(
      '/organization-customer/create',
      dto
    );
    return res.data.data;
  }

  static async update(
    id: string,
    dto: UpdateOrgCustomerDto
  ): Promise<OrganizationCustomer> {
    const res = await api.patch<ApiResponse<OrganizationCustomer>>(
      `/organization-customer/update/${id}`,
      dto
    );
    return res.data.data;
  }

  static async hardDelete(id: string): Promise<void> {
    await api.delete(`/organization-customer/remove/${id}/hard`);
  }

  static async convertToUser(
    dto: ConvertCustomerToUserDto
  ): Promise<any> {  // здесь можно уточнить тип возвращаемого пользователя
    const res = await api.post<ApiResponse<any>>(
      '/organization-customer/convert-to-user',
      dto
    );
    return res.data;
  }
}