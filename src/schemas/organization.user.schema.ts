// src/schemas/organization.user.schema.ts
import { z } from "zod";

// --- Enums ---
export const OrgUserRole = z.enum(["OWNER", "ADMIN", "MANAGER", "SELLER", "ACCOUNTANT"]);

export const SortOrder = z.enum(["asc", "desc"]);

export const OrganizationUserSortField = z.enum([
  "createdAt",
  "updatedAt",
  "role",
  "position",
]);

export const GenderDtoEnum = z.enum(["MALE", "FEMALE", "OTHER"]);

// --- Nested Schemas (based on CreateTenantUserProfileDto & CreateUserPhoneDto) ---

export const CreateUserPhoneSchema = z.object({
  // userId is internal/optional (skipped for frontend DTO)
  phone: z.string().min(1, "Phone number is required").regex(/^\+?[1-9]\d{1,14}$/, {
    message: 'Phone must be in E.164 format (e.g., +998901234567)',
  }),
  isPrimary: z.boolean().default(false),
  note: z.string().optional(),
});
export type CreateUserPhoneDto = z.infer<typeof CreateUserPhoneSchema>;


export const CreateTenantUserProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  patronymic: z.string().optional(),
  dateOfBirth: z.string().datetime().optional(), // Use string/datetime for ISO date format
  gender: GenderDtoEnum.optional(),

  // Passport details (optional)
  passportSeries: z.string().optional(),
  passportNumber: z.string().optional(),
  issuedBy: z.string().optional(),
  issuedDate: z.string().datetime().optional(),
  expiryDate: z.string().datetime().optional(),

  // Address details (optional)
  country: z.string().optional(),
  region: z.string().optional(),
  city: z.string().optional(),
  address: z.string().optional(),
  registration: z.string().optional(), // Propiska addressi
  district: z.string().optional(), // Hudud, Rayon
});
export type CreateTenantUserProfileDto = z.infer<typeof CreateTenantUserProfileSchema>;


export const CreateTenantUserSchema = z.object({
  email: z.string().email("Invalid email address").optional(),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .max(255)
    .regex(/^(?=.*[A-Z])(?=.*\d).{8,255}$/, {
      message: 'Password must contain at least one uppercase letter (A-Z) and one digit (0-9).',
    }),
  isActive: z.boolean().default(true).optional(),

  // Nested DTOs
  profile: CreateTenantUserProfileSchema,
  phone_numbers: z.array(CreateUserPhoneSchema)
    .min(1, 'At least one phone number is required')
    .refine(
      (phones) => phones.some(p => p.isPrimary),
      "At least one phone number must be marked as primary (isPrimary: true)."
    ),
}).refine(
  (data) => data.email || (data.phone_numbers && data.phone_numbers.length > 0),
  "Either email or at least one phone number must be provided."
);
export type CreateTenantUserDto = z.infer<typeof CreateTenantUserSchema>;


// --- Main DTOs for the API Endpoints ---

// 1. DTO for creating an OrganizationUser with an existing Tenant User
export const CreateOrganizationUserSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID format"),
  userId: z.string().uuid("Invalid user ID format"),
  role: OrgUserRole,
  position: z.string().optional(),
});
export type CreateOrganizationUserDto = z.infer<typeof CreateOrganizationUserSchema>;


// 2. DTO for creating an OrganizationUser ALONG WITH a new Tenant User (The requested DTO)
// This DTO structure matches the controller: @Body() dto: CreateOrgUserWithUserDto
// It MUST include 'organizationId' which is passed in the URL in the other service method
// but in your specific controller, it's part of the DTO (check controller/service usage):
// Controller: async createWithUser(@Body() dto: CreateOrgUserWithUserDto)
// Service: async createWithUser(dto: CreateOrgUserWithUserDto) -> uses dto.organizationId
export const CreateOrganizationUserWithUserSchema = z.object({
  organizationId: z.string().uuid("Invalid organization ID format"), // Must be here for the service logic
  role: OrgUserRole,
  position: z.string().optional(),
  user: CreateTenantUserSchema,
});
export type CreateOrgUserWithUserDto = z.infer<typeof CreateOrganizationUserWithUserSchema>;


// --- Filter and Update Schemas ---
export const OrgUserFilterSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
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
export type UpdateOrganizationUserDto = z.infer<typeof UpdateOrganizationUserSchema>;

// --- Export Types ---
export type OrgUserRole = z.infer<typeof OrgUserRole>;


type FormInput = z.input<typeof CreateOrganizationUserWithUserSchema>;
type FormValues = Omit<FormInput, 'organizationId'>;