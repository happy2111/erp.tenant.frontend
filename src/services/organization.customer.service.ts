import {
  CreateOrgCustomerRequest,
  UpdateOrgCustomerRequest,
  OrganizationCustomerFilterRequest,
  ConvertCustomerToUserRequest,
  OrganizationCustomerFilterSchema,
  CreateOrgCustomerSchema
} from "@/schemas/organization.customer.schema"; // Предполагая, что вы сохранили Zod схемы в этом файле
import api from "@/lib/axiosInstance"; // Ваш настроенный экземпляр axios

// --- Типы ответов (Для Zod их нужно будет определить) ---

// Базовый тип клиента (OrganizationCustomer), отражающий вашу Prisma модель
export type OrganizationCustomer = {
  id: string;
  organizationId: string;
  userId: string | null;
  firstName: string;
  lastName: string;
  patronymic: string | null;
  phone: string;
  type: string; // Замените на CustomerType если нужно
  isBlacklisted: boolean;
  createdAt: string; // Date в виде ISO строки
  updatedAt: string; // Date в виде ISO строки
};

// Тип для ответа фильтрации с пагинацией
export type FilterResponse<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
};

// Тип для ответа после конвертации (пользователь с профилем и телефонами)
export type ConvertedUser = {
  id: string;
  email: string | null;
  isActive: boolean;
  profile: {
    id: string;
    firstName: string;
    lastName: string;
    // ... другие поля профиля
  } | null;
  phone_numbers: Array<{
    id: string;
    phone: string;
    isPrimary: boolean;
    note: string | null;
  }>;
  // ... другие поля User
}

/**
 * Сервис для управления клиентами организации (OrganizationCustomer)
 */
export class OrganizationCustomerService {
  private readonly baseUrl = "/organization-customer";

  /**
   * Создание нового клиента организации.
   * POST /organization-customer/create
   */
  async create(dto: CreateOrgCustomerRequest): Promise<OrganizationCustomer> {
    // Опционально: Валидация DTO перед отправкой
    // CreateOrgCustomerSchema.parse(dto);

    const res = await api.post(`${this.baseUrl}/create`, dto);
    // Сервер возвращает { success: true, customer: ... }
    return res.data.customer;
  }

  /**
   * Конвертация существующего клиента (без userId) в полноценного пользователя.
   * POST /organization-customer/convert-to-user
   */
  async convertToUser(dto: ConvertCustomerToUserRequest): Promise<ConvertedUser> {
    const res = await api.post(`${this.baseUrl}/convert-to-user`, dto);
    // Сервер возвращает самого пользователя при успехе
    return res.data;
  }

  /**
   * Получение списка клиентов с фильтрацией и пагинацией.
   * POST /organization-customer/filter
   */
  async filter(dto: OrganizationCustomerFilterRequest): Promise<FilterResponse<OrganizationCustomer>> {
    // Используем POST с Body для фильтрации, как определено в контроллере
    const res = await api.post(`${this.baseUrl}/filter`, dto);
    // Сервер возвращает { data: [...], total: N, page: N, limit: N }
    return res.data.data;
  }

  /**
   * Обновление данных клиента организации по ID.
   * PATCH /organization-customer/:id
   */
  async update(id: string, dto: UpdateOrgCustomerRequest): Promise<OrganizationCustomer> {
    const res = await api.patch(`${this.baseUrl}/${id}`, dto);
    // Сервер возвращает обновлённый объект OrganizationCustomer
    return res.data;
  }

  /**
   * Удаление клиента организации по ID.
   * DELETE /organization-customer/:id
   */
  async delete(id: string): Promise<void> {
    await api.delete(`${this.baseUrl}/${id}`);
  }
}