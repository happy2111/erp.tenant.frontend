import api from '@/lib/axiosInstance';
import {
  CreateInstallmentPlanDto,
  UpdateInstallmentPlanDto,
  UpdateInstallmentSettingDto,
  InstallmentSetting,
  InstallmentSettingSchema,
  InstallmentPlan,
  InstallmentLimit,
  UpsertInstallmentLimitDto,
  InstallmentLimitSchema,
} from '@/schemas/installment-settings.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class InstallmentSettingsService {
  static async getMySettings(): Promise<InstallmentSetting> {
    const res = await api.get<ApiResponse<InstallmentSetting>>(
      '/installment-settings/my'
    );
    const actualData = res.data.data?.data || res.data.data;
    return InstallmentSettingSchema.parse(actualData);
  }

  static async updateMySettings(
    dto: UpdateInstallmentSettingDto
  ): Promise<InstallmentSetting> {
    const res = await api.patch<ApiResponse<InstallmentSetting>>(
      '/installment-settings/my',
      dto
    );
    const actualData = res.data.data?.data || res.data.data;
    return InstallmentSettingSchema.parse(actualData);
  }

  static async createPlan(dto: CreateInstallmentPlanDto): Promise<InstallmentPlan> {
    const res = await api.post<ApiResponse<InstallmentPlan>>(
      '/installment-settings/plans',
      dto
    );
    const actualData = res.data.data?.data || res.data.data;
    return actualData;
  }

  static async updatePlan(planId: string, dto: UpdateInstallmentPlanDto): Promise<InstallmentPlan> {
    const res = await api.patch<ApiResponse<InstallmentPlan>>(
      `/installment-settings/plans/${planId}`,
      dto
    );
    const actualData = res.data.data?.data || res.data.data;
    return actualData;
  }

  static async deletePlan(planId: string): Promise<void> {
    await api.delete(`/installment-settings/plans/${planId}`);
  }

  static async upsertLimit(
    currencyId: string,
    dto: UpsertInstallmentLimitDto
  ): Promise<InstallmentLimit> {
    const res = await api.post<ApiResponse<InstallmentLimit>>(
      `/installment-settings/limits?currencyId=${currencyId}`,
      dto
    );
    const actualData = res.data.data?.data || res.data.data;
    return actualData;
  }

  static async deleteLimit(limitId: string): Promise<void> {
    await api.delete(`/installment-settings/limits/${limitId}`);
  }
}
