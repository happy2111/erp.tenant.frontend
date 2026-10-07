import { z } from 'zod';
import api from '@/lib/axiosInstance';
import {
  CreateIntegrationTokenDto,
  CreatedIntegrationToken,
  CreatedIntegrationTokenSchema,
  IntegrationToken,
  IntegrationTokenSchema,
  INTEGRATION_SCOPES,
} from '@/schemas/integration-tokens.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

function unwrapData<T>(payload: T | ApiResponse<T>): T {
  if (
    payload &&
    typeof payload === 'object' &&
    'data' in payload &&
    (payload as ApiResponse<T>).data !== undefined
  ) {
    return (payload as ApiResponse<T>).data;
  }
  return payload as T;
}

export class IntegrationTokensService {
  static readonly SCOPES = INTEGRATION_SCOPES;

  static async list(): Promise<IntegrationToken[]> {
    const res = await api.get<
      IntegrationToken[] | ApiResponse<IntegrationToken[]>
    >('/integration-tokens');
    return z.array(IntegrationTokenSchema).parse(unwrapData(res.data));
  }

  static async create(
    dto: CreateIntegrationTokenDto,
  ): Promise<CreatedIntegrationToken> {
    const body = {
      name: dto.name.trim(),
      scopes: [INTEGRATION_SCOPES.INSTALLMENT_SETTINGS_READ],
      ...(dto.expiresAt
        ? { expiresAt: new Date(dto.expiresAt).toISOString() }
        : {}),
    };

    const res = await api.post<
      CreatedIntegrationToken | ApiResponse<CreatedIntegrationToken>
    >('/integration-tokens', body);

    return CreatedIntegrationTokenSchema.parse(unwrapData(res.data));
  }

  static async revoke(id: string): Promise<void> {
    await api.delete(`/integration-tokens/${id}`);
  }
}
