import { z } from 'zod';

export const INTEGRATION_SCOPES = {
  INSTALLMENT_SETTINGS_READ: 'INSTALLMENT_SETTINGS_READ',
} as const;

export type IntegrationScope =
  (typeof INTEGRATION_SCOPES)[keyof typeof INTEGRATION_SCOPES];

export const CreateIntegrationTokenSchema = z.object({
  name: z
    .string()
    .min(1, 'Nom majburiy')
    .max(100, 'Nom juda uzun'),
  expiresAt: z.string().optional().or(z.literal('')),
});

export type CreateIntegrationTokenDto = z.infer<
  typeof CreateIntegrationTokenSchema
>;

export const IntegrationTokenSchema = z.object({
  id: z.string(),
  name: z.string(),
  tokenPrefix: z.string(),
  organizationId: z.string(),
  scopes: z.array(z.string()),
  isActive: z.boolean(),
  expiresAt: z.string().nullable().optional(),
  lastUsedAt: z.string().nullable().optional(),
  createdByUserId: z.string().nullable().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export type IntegrationToken = z.infer<typeof IntegrationTokenSchema>;

export const CreatedIntegrationTokenSchema = IntegrationTokenSchema.extend({
  token: z.string(),
}).omit({ lastUsedAt: true, createdByUserId: true, updatedAt: true });

export type CreatedIntegrationToken = z.infer<
  typeof CreatedIntegrationTokenSchema
>;
