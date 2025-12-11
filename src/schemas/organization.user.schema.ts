import { z } from "zod";

export const OrgUserRole = z.enum(["OWNER", "ADMIN", "EMPLOYEE", "MANAGER"]);

export const CreateOrganizationUserSchema = z.object({
  organizationId: z.string().uuid(),
  userId: z.string().uuid(),
  role: OrgUserRole,
  position: z.string().optional(),
});

export type CreateOrganizationUserDto = z.infer<typeof CreateOrganizationUserSchema>;

export const CreateTenantUserSchema = z.object({
  // временно, ты пришлёшь точную структуру:
  email: z.string().email(),
  firstName: z.string(),
  lastName: z.string(),
  phone: z.string(),
});


export const CreateOrganizationUserWithTenantSchema = z.object({
  role: OrgUserRole,
  position: z.string().optional(),
  user: CreateTenantUserSchema,
});

export type CreateOrganizationUserWithTenantDto = z.infer<
  typeof CreateOrganizationUserWithTenantSchema
>;

export type OrgUserRole = z.infer<typeof OrgUserRole>

export const SortOrder = z.enum(["asc", "desc"]);

export const OrganizationUserSortField = z.enum([
  "createdAt",
  "updatedAt",
  "role",
  "position",
]);


export const OrgUserFilterSchema = z.object({
  page: z.number().default(1),
  limit: z.number().default(10),

  organizationId: z.string().uuid().optional(),

  role: OrgUserRole.optional(),

  search: z.string().optional(),

  sortBy: OrganizationUserSortField.optional().default("createdAt"),

  sortOrder: SortOrder.optional().default("desc"),
});

export type OrgUserFilterDto = z.infer<typeof OrgUserFilterSchema>;

export const UpdateOrganizationUserSchema = z.object({
  role: OrgUserRole.optional(),
  position: z.string().optional(),
});

export type UpdateOrganizationUserDto = z.infer<
  typeof UpdateOrganizationUserSchema
>;


