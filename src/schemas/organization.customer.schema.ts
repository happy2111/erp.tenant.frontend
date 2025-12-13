import { z } from "zod";

// --- Перечисления (Enums) ---

// Основано на .prisma/client-tenant CustomerType
export enum CustomerType {
  CLIENT = "CLIENT",
  SUPPLIER = "SUPPLIER",
}
export const CustomerTypeEnum = z.nativeEnum(CustomerType);

// Основано на OrganizationCustomerFilterDto SortOrder
export enum SortOrder {
  ASC = "asc",
  DESC = "desc",
}
export const SortOrderEnum = z.nativeEnum(SortOrder);

// Основано на GenderDtoEnum (из CreateTenantUserProfileDto)
export enum GenderDtoEnum {
  MALE = "MALE",
  FEMALE = "FEMALE",
}
export const GenderDtoEnumZod = z.nativeEnum(GenderDtoEnum);


// --- DTO Схемы ---

/**
 * Схема для CreateOrgCustomerDto
 * Используется для создания нового клиента организации.
 */
export const CreateOrgCustomerSchema = z.object({
  organizationId: z.string().uuid("organizationId must be a valid UUID"),
  userId: z.string().uuid("userId must be a valid UUID").optional().nullable(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  // Исправлено: убрано .min(1) для nullable/optional полей
  patronymic: z.string().max(255).optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  type: CustomerTypeEnum,
  isBlacklisted: z.boolean().default(false),
});

/**
 * Схема для UpdateOrgCustomerDto
 * Используется для частичного обновления клиента организации.
 */
export const UpdateOrgCustomerSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  patronymic: z.string().min(1).max(255).optional().nullable(),
  // Валидация телефона упрощена
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format").optional(),
  type: CustomerTypeEnum.optional(),
  isBlacklisted: z.boolean().optional(),
});


/**
 * Схема для OrganizationCustomerFilterDto
 * Используется для фильтрации и пагинации клиентов.
 */
export const OrganizationCustomerFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).default(10),
  sortOrder: SortOrderEnum.default(SortOrder.DESC),
  sortBy: z.string().default('createdAt').optional(), // Упрощение: можно ограничить список полей
  isBlacklisted: z.boolean().optional(),
  organizationId: z.string().uuid().optional(),
  search: z.string().optional(),
});


// --- Схемы для ConvertCustomerToUserDto ---

// Схема для CreateTenantUserPhoneItemDto
export const CreateTenantUserPhoneItemSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, "Invalid phone number format"),
  note: z.string().optional().nullable(),
  isPrimary: z.boolean().optional(),
});

// Схема для CustomerToUserProfileDto
export const CustomerToUserProfileSchema = z.object({
  // Zod's .coerce.date() помогает обрабатывать строки ISO в Date объекты
  dateOfBirth: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : val),
  gender: GenderDtoEnumZod.optional(),
  passportSeries: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  issuedBy: z.string().optional().nullable(),
  issuedDate: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : val),
  expiryDate: z.string().datetime().optional().nullable().transform((val) => val ? new Date(val) : val),
  country: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  registration: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
}).partial(); // Делаем все поля профиля необязательными, как в CustomerToUserProfileDto

// Схема для CustomerToUserDto (внутри конвертации)
export const CustomerToUserSchema = z.object({
  email: z.string().email("Invalid email format").optional().nullable(),
  // Валидация пароля
  password: z.string()
    .min(8, 'Пароль должен быть длиной от 8 до 255 символов')
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*\d).*$/, {
      message: 'Пароль должен содержать минимум одну заглавную букву (A-Z) и минимум одну цифру (0-9).',
    }),
  isActive: z.boolean().default(true).optional(),
  profile: CustomerToUserProfileSchema,
});

/**
 * Схема для ConvertCustomerToUserDto
 * Используется для преобразования клиента в полноценного пользователя.
 */
export const ConvertCustomerToUserSchema = z.object({
  customerId: z.string().uuid("customerId must be a valid UUID"),
  user: CustomerToUserSchema,
  phonesToAdd: z.array(CreateTenantUserPhoneItemSchema).optional(),
});


// --- Типы (Types) ---

export type UpdateOrgCustomerRequest = z.infer<typeof UpdateOrgCustomerSchema>;
export type OrganizationCustomerFilterRequest = z.infer<typeof OrganizationCustomerFilterSchema>;
export type ConvertCustomerToUserRequest = z.infer<typeof ConvertCustomerToUserSchema>;
export type CreateOrgCustomerRequest = z.infer<typeof CreateOrgCustomerSchema>;
