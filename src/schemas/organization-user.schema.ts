import { z } from "zod";

// ─── DTO для создания привязки существующего пользователя ───────
export const CreateOrganizationUserSchema = z.object({
  organizationId: z.string().uuid("Некорректный ID организации"),
  userId: z.string().uuid("Некорректный ID пользователя"),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "EMPLOYEE", "CASHIER"], {
    message: "Некорректная роль",
  }),
  position: z.string().max(100).optional().nullable(),
});

// ─── DTO для создания нового пользователя + привязка ─────────────
export const CreateOrgUserWithUserSchema = z.object({
  organizationId: z.string().uuid("Некорректный ID организации"),
  role: z.enum(["OWNER", "ADMIN", "MANAGER", "EMPLOYEE", "CASHIER"], {
    message: "Некорректная роль",
  }),
  position: z.string().max(100).optional().nullable(),
  user: z.object({
    email: z.string().email("Некорректный email").optional(),
    password: z.string().min(8, "Пароль должен содержать минимум 8 символов"),
    // profile
    firstName: z.string().min(1, "Имя обязательно"),
    lastName: z.string().min(1, "Фамилия обязательна"),
    patronymic: z.string().optional().nullable(),
    gender: z.enum(["MALE", "FEMALE", "OTHER"]).optional(),
    dateOfBirth: z.string().datetime().optional().nullable(),
    // phone_numbers (массив)
    phone_numbers: z
      .array(
        z.object({
          phone: z.string().min(9, "Номер телефона слишком короткий"),
          isPrimary: z.boolean().optional(),
          note: z.string().max(100).optional().nullable(),
        }),
      )
      .optional(),
  }),
});

// ─── DTO для обновления ───────────────────────────────────────────
export const UpdateOrganizationUserSchema = z.object({
  role: z
    .enum(["OWNER", "ADMIN", "MANAGER", "EMPLOYEE", "CASHIER"])
    .optional(),
  position: z.string().max(100).optional().nullable(),
});

// ─── Query для списка (админка) ───────────────────────────────────
export const GetOrgUsersQuerySchema = z.object({
  search: z.string().optional().nullable(),
  sortField: z
    .enum([
      "createdAt",
      "updatedAt",
      "role",
      "position",
      "user.profile.firstName",
      "user.profile.lastName",
    ])
    .optional()
    .nullable(),
  order: z.enum(["asc", "desc"]).optional().nullable(),
  page: z.number().min(1).optional().nullable(),
  limit: z.number().min(1).max(100).optional().nullable(),
});

// ─── Типы сущностей ──────────────────────────────────────────────
export type CreateOrganizationUserDto = z.infer<typeof CreateOrganizationUserSchema>;
export type CreateOrgUserWithUserDto = z.infer<typeof CreateOrgUserWithUserSchema>;
export type UpdateOrganizationUserDto = z.infer<typeof UpdateOrganizationUserSchema>;
export type GetOrgUsersQueryDto = z.infer<typeof GetOrgUsersQuerySchema>;

// ─── Тип возвращаемой сущности OrganizationUser ──────────────────
export type OrganizationUser = {
  id: string;
  organizationId: string;
  userId: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE" | "CASHIER";
  position?: string | null;
  createdAt: Date;
  updatedAt: Date;

  user: {
    id: string;
    email?: string | null;
    isActive: boolean;
    profile?: {
      firstName: string;
      lastName: string;
      patronymic?: string | null;
      gender?: "MALE" | "FEMALE" | "OTHER";
      dateOfBirth?: Date | null;
    } | null;
    phone_numbers: Array<{
      phone: string;
      isPrimary: boolean;
      note?: string | null;
    }>;
  };
};

export type OrganizationUserListItem = OrganizationUser; // для списка