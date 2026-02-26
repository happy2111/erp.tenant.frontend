import { z } from 'zod';

export const GenderValues = ['MALE', 'FEMALE', 'OTHER'] as const;
export type GenderDto = typeof GenderValues[number];

export const CreateTenantUserProfileSchema = z.object({
  firstName: z.string().min(1, 'Имя обязательно'),
  lastName: z.string().min(1, 'Фамилия обязательна'),
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

export const CreateTenantUserPhoneSchema = z.object({
  phone: z.string().regex(/^\+?[1-9]\d{1,14}$/, 'Некорректный формат телефона'),
  isPrimary: z.boolean(),
  note: z.string().optional().nullable(),
});

export const CreateTenantUserSchema = z.object({
  email: z.string().email('Некорректный email').optional(),
  password: z.string().min(8, 'Пароль минимум 8 символов'),
  isActive: z.boolean().optional().default(true),
  profile: CreateTenantUserProfileSchema,
  phone_numbers: z.array(CreateTenantUserPhoneSchema).min(1, 'Хотя бы один телефон обязателен'),
});

export const UpdateTenantUserSchema = z.object({
  email: z.string().email().optional(),
  password: z.string().min(8).optional(),
  isActive: z.boolean().optional(),
  profile: CreateTenantUserProfileSchema.partial().optional(),
  phonesToAdd: z.array(CreateTenantUserPhoneSchema).optional(),
  phonesToUpdate: z
    .array(
      z.object({
        id: z.string().uuid(),
        phone: z.string().regex(/^\+?[1-9]\d{1,14}$/).optional(),
        isPrimary: z.boolean().optional(),
        note: z.string().optional().nullable(),
      }),
    )
    .optional(),
  phonesToDelete: z.array(z.string().uuid()).optional(),
});

export const GetTenantUsersQuerySchema = z.object({
  search: z.string().optional().nullable(),
  sortField: z.enum([
    'createdAt',
    'updatedAt',
    'email',
    'profile.firstName',
    'profile.lastName',
  ]).optional().nullable(),
  order: z.enum(['asc', 'desc']).optional().nullable(),
  page: z.number().min(1).optional().nullable(),
  limit: z.number().min(1).max(100).optional().nullable(),
});

export type Phone = {
  phone: string;
  note?: string;
  isPrimary: boolean;
};


// ─── Типы ────────────────────────────────────────────────────────
export type CreateTenantUserDto = z.infer<typeof CreateTenantUserSchema>;
export type UpdateTenantUserDto = z.infer<typeof UpdateTenantUserSchema>;
export type GetTenantUsersQueryDto = z.infer<typeof GetTenantUsersQuerySchema>;

export type TenantUser = {
  data: any;
  id: string;
  email?: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  profile?: {
    firstName: string;
    lastName: string;
    patronymic?: string | null;
    dateOfBirth?: Date | null;
    gender?: GenderDto;
    passportSeries?: string | null;
    passportNumber?: string | null;
    issuedBy?: string | null;
    issuedDate?: Date | null;
    expiryDate?: Date | null;
    country?: string | null;
    region?: string | null;
    city?: string | null;
    address?: string | null;
    registration?: string | null;
    district?: string | null;
  } | null;
  phone_numbers: Array<{
    id: string;
    phone: string;
    isPrimary: boolean;
    note?: string | null;
  }>;
};


export const CheckUserExistenceResponseSchema = z.object({
  userId: z.string().uuid(),
  email: z.string().email().nullable(),
  organizations: z.array(
    z.object({
      organizationId: z.string().uuid(),
      organizationName: z.string(),
      role: z.string(), // Здесь можно использовать z.enum, если роли фиксированы
    })
  ),
});


export type CheckUserExistenceResponse = z.infer<typeof CheckUserExistenceResponseSchema>;

export const TenantUserSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email().nullable().optional(),
  isActive: z.boolean(),
  createdAt: z.string().datetime().or(z.date()),
  updatedAt: z.string().datetime().or(z.date()),
  profile: z.object({
    firstName: z.string(),
    lastName: z.string(),
    patronymic: z.string().nullable().optional(),
  }).nullable().optional(),
  phone_numbers: z.array(z.object({
    id: z.string().uuid(),
    phone: z.string(),
    isPrimary: z.boolean(),
    note: z.string().nullable().optional(),
  })),
});