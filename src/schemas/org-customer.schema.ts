import { z } from 'zod';
import { GenderValues } from './tenant-user.schema';

export const CustomerTypeValues = ['CLIENT', 'SUPPLIER'] as const;
export type CustomerType = typeof CustomerTypeValues[number];
export const CustomerTypeLabels: Record<CustomerType, string> = {
  CLIENT: 'MIJOZ',
  SUPPLIER: 'TA’MINOTCHI',
}

export const CreateOrgCustomerSchema = z.object({
  userId: z.string().uuid().optional().nullable(),
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  patronymic: z.string().max(255).optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный формат телефона'),
  type: z.enum(CustomerTypeValues),
  isBlacklisted: z.boolean().optional().default(false),
});

export type CreateOrgCustomerDto = z.infer<typeof CreateOrgCustomerSchema>;

export const UpdateOrgCustomerSchema = z.object({
  firstName: z.string().min(1).max(255).optional(),
  lastName: z.string().min(1).max(255).optional(),
  patronymic: z.string().max(255).optional().nullable(),
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
  type: z.enum(CustomerTypeValues).optional(),
  isBlacklisted: z.boolean().optional(),
});

export type UpdateOrgCustomerDto = z.infer<typeof UpdateOrgCustomerSchema>;

export const OrganizationCustomerFilterSchema = z.object({
  page: z.coerce.number().min(1).catch(1).optional(),
  type: z.enum(CustomerTypeValues).optional(),
  limit: z.coerce.number().min(1).max(100).catch(10).optional(),
  search: z.string().optional().catch(''),
  sortBy: z.string().catch('createdAt').optional(),
  sortOrder: z.enum(['asc', 'desc']).catch('desc').optional(),
  isBlacklisted: z.coerce.boolean().optional().catch(undefined),
});

export type OrganizationCustomerFilterDto = z.infer<typeof OrganizationCustomerFilterSchema>;

export const CustomerToUserProfileSchema = z.object({
  firstName: z.string().min(1).optional(),
  lastName: z.string().min(1).optional(),
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
  email: z.string().email().optional(),
  password: z.string().min(8, 'Минимум 8 символов'),
  isActive: z.boolean().optional().default(true),
  profile: CustomerToUserProfileSchema,
});

export const ConvertCustomerToUserSchema = z.object({
  customerId: z.string().uuid("Некорректный ID клиента"),
  user: CustomerToUserSchema,
  phonesToAdd: z
    .array(
      z.object({
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/),
        isPrimary: z.boolean().default(false),
        note: z.string().optional().nullable(),
      })
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
  lastName: z.string(),
  patronymic: z.string().nullable().optional(),
  phone: z.string(),
  type: z.enum(CustomerTypeValues),
  isBlacklisted: z.boolean(),
  createdAt: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date()),
  updatedAt: z.preprocess((arg) => typeof arg === "string" ? new Date(arg) : arg, z.date()),
});

export type OrganizationCustomer = z.infer<typeof OrganizationCustomerSchema>;

export const OrganizationCustomerListSchema = z.object({
  items: z.array(OrganizationCustomerSchema),
  total: z.number(),
});