import { z } from 'zod';
import { GenderValues } from './tenant-user.schema';

const atLeastOneRole = (data: { isClient?: boolean; isSupplier?: boolean }) =>
  Boolean(data.isClient) || Boolean(data.isSupplier);

export const CreateOrgCustomerSchema = z
  .object({
    userId: z.string().uuid().optional().nullable(),
    firstName: z.string().min(1).max(255),
    lastName: z.string().max(255).optional().nullable(),
    patronymic: z.string().max(255).optional().nullable(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный формат телефона')
      .optional()
      .nullable()
      .or(z.literal('')),
    isClient: z.boolean(),
    isSupplier: z.boolean(),
    isBlacklisted: z.boolean().optional().default(false),
  })
  .refine(atLeastOneRole, {
    message: 'Выберите хотя бы одну роль: Клиент или Поставщик',
    path: ['isClient'],
  })
  .transform((data) => ({
    ...data,
    phone: data.phone === '' ? null : data.phone,
    lastName: data.lastName === '' ? null : data.lastName,
  }));

export type CreateOrgCustomerDto = z.infer<typeof CreateOrgCustomerSchema>;

export const UpdateOrgCustomerSchema = z
  .object({
    firstName: z.string().min(1).max(255).optional(),
    lastName: z.string().max(255).optional().nullable(),
    patronymic: z.string().max(255).optional().nullable(),
    phone: z
      .string()
      .regex(/^\+?[1-9]\d{1,14}$/)
      .optional()
      .nullable()
      .or(z.literal('')),
    isClient: z.boolean().optional(),
    isSupplier: z.boolean().optional(),
    isBlacklisted: z.boolean().optional(),
  })
  .refine(
    (data) => {
      if (data.isClient === undefined && data.isSupplier === undefined) return true;
      if (data.isClient === false && data.isSupplier === false) return false;
      return true;
    },
    {
      message: 'Нельзя снять обе роли',
      path: ['isClient'],
    },
  )
  .transform((data) => ({
    ...data,
    phone: data.phone === '' ? null : data.phone,
    lastName: data.lastName === '' ? null : data.lastName,
  }));

export type UpdateOrgCustomerDto = z.infer<typeof UpdateOrgCustomerSchema>;

export const OrganizationCustomerFilterSchema = z.object({
  page: z.coerce.number().min(1).catch(1).optional(),
  isClient: z.coerce.boolean().optional().catch(undefined),
  isSupplier: z.coerce.boolean().optional().catch(undefined),
  limit: z.coerce.number().min(1).max(100).catch(10).optional(),
  search: z.string().optional().catch(''),
  sortBy: z.string().catch('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).catch('desc').optional(),
  isBlacklisted: z.coerce.boolean().optional().catch(undefined),
});

export type OrganizationCustomerFilterDto = z.infer<typeof OrganizationCustomerFilterSchema>;

export const CustomerToUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().optional().nullable(),
  patronymic: z.string().optional().nullable(),
  dateOfBirth: z.string().datetime().optional().nullable(),
  gender: z.enum(GenderValues).optional(),
  passportSeries: z.string().optional().nullable(),
  passportNumber: z.string().optional().nullable(),
  issuedBy: z.string().optional().nullable(),
  issuedDate: z.string().datetime().optional().nullable(),
  expiryDate: z.string().datetime().optional().nullable(),
  country: z.string().optional().nullable(),
  region: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  registration: z.string().optional().nullable(),
  district: z.string().optional().nullable(),
});

export const CustomerToUserSchema = z.object({
  email: z
    .string()
    .trim()
    .optional()
    .transform((v) => (v && v.length > 0 ? v : undefined))
    .pipe(z.string().email().optional()),
  password: z
    .string()
    .optional()
    .transform((v) => (v && v.trim().length > 0 ? v.trim() : undefined))
    .pipe(z.string().min(8, 'Минимум 8 символов').optional()),
  isActive: z.boolean().optional().default(true),
  profile: CustomerToUserProfileSchema,
});

export const ConvertCustomerToUserSchema = z.object({
  customerId: z.string().uuid('Некорректный ID клиента'),
  user: CustomerToUserSchema,
  phonesToAdd: z
    .array(
      z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        isPrimary: z.boolean().default(false),
        note: z.string().optional().nullable(),
      }),
    )
    .optional()
    .default([]),
});

export type ConvertCustomerToUserDto = z.infer<typeof ConvertCustomerToUserSchema>;

export const OrganizationCustomerSchema = z.object({
  id: z.string().uuid(),
  organizationId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  firstName: z.string(),
  lastName: z.string().nullable().optional(),
  patronymic: z.string().nullable().optional(),
  phone: z.string().nullable().optional(),
  isClient: z.boolean(),
  isSupplier: z.boolean(),
  isBlacklisted: z.boolean(),
  createdAt: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date(),
  ),
  updatedAt: z.preprocess(
    (arg) => (typeof arg === 'string' ? new Date(arg) : arg),
    z.date(),
  ),
});

export type OrganizationCustomer = z.infer<typeof OrganizationCustomerSchema>;

export const OrganizationCustomerListSchema = z.object({
  items: z.array(OrganizationCustomerSchema),
  total: z.number(),
});

/** @deprecated Pricing segment only — kept for product-prices. Not org-customer identity. */
export const CustomerTypeValues = ['CLIENT', 'SUPPLIER'] as const;
export type CustomerType = (typeof CustomerTypeValues)[number];
export const CustomerTypeLabels: Record<CustomerType, string> = {
  CLIENT: 'MIJOZ',
  SUPPLIER: "TA'MINOTCHI",
};
