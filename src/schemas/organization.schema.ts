import { z } from "zod";

export const CreateOrganizationSchema = z.object({
  name: z.string().min(1, "Organization name is required").max(255),
  address: z.string().max(500).optional().nullable(),
  phone: z.string().max(20).optional().nullable(),
  email: z.string().email().optional().nullable(),
});


export const GetOrganizationsQuery = z.object({
  search: z.string().optional().nullable(),
  order: z.enum(["asc", "desc"]).optional().nullable(),
  sortField: z.enum(["name", "email", "phone", "createdAt"]).optional().nullable(),
})

export const UpdateOrganizationSchema = CreateOrganizationSchema.partial();

export type CreateOrganizationDto = z.infer<typeof CreateOrganizationSchema>;
export type UpdateOrganizationDto = z.infer<typeof UpdateOrganizationSchema>;
export type GetOrganizationsQueryDto = z.infer<typeof GetOrganizationsQuery>;


export enum OrgUserRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  EMPLOYEE = "EMPLOYEE",
  MANAGER = "MANAGER",
}

export type Organization = {
  id: string;
  name: string;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  createdAt: Date;
  updatedAt: Date;
  org_users?: Array<{
    id: string;
    role: OrgUserRole;
    position?: string | null;
  }>;
  settings?: {
    id: string;
    organizationId: string;
    // Add other setting fields as needed
  } | null;
  kassas?: Array<{
    id: string;
    name: string;
    // Add other kassa fields as needed
  }>;
};

export type OrganizationWithUserRole = Organization & {
  userRole?: OrgUserRole;
  userPosition?: string | null;
};

