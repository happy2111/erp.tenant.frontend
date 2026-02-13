import api from '@/lib/axiosInstance';
import {
  CreateInstallmentPlanDto,
  UpdateInstallmentPlanDto,
  UpdateInstallmentSettingDto,
  InstallmentSetting,
  InstallmentSettingSchema,
  InstallmentPlan,
} from '@/schemas/installment-settings.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class InstallmentSettingsService {
  /**
   * Получить текущие настройки рассрочки организации
   * (включая все доступные планы)
   */
  static async getMySettings(): Promise<InstallmentSetting> {
    const res = await api.get<ApiResponse<InstallmentSetting>>(
      '/installment-settings/my'
    );

    // безопасная валидация
    const actualData = res.data.data?.data || res.data.data;
    return InstallmentSettingSchema.parse(actualData);
  }

  /**
   * Обновить глобальные настройки рассрочки
   * (isActive, minInitialPayment, maxAmount, штрафы и т.д.)
   */
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

  /**
   * Создать новый план рассрочки
   * (например, 6 месяцев с коэффициентом 1.15)
   */
  static async createPlan(
    dto: CreateInstallmentPlanDto
  ): Promise<InstallmentPlan> {
    const res = await api.post<ApiResponse<InstallmentPlan>>(
      '/installment-settings/plans',
      dto
    );



    const actualData = res.data.data?.data || res.data.data;

    return actualData;
  }

  /**
   * Обновить существующий план рассрочки
   */
  static async updatePlan(
    planId: string,
    dto: UpdateInstallmentPlanDto
  ): Promise<InstallmentPlan> {
    const res = await api.patch<ApiResponse<InstallmentPlan>>(
      `/installment-settings/plans/${planId}`,
      dto
    );

    const actualData = res.data.data?.data || res.data.data;


    return actualData;
  }

  /**
   * Удалить план рассрочки
   */
  static async deletePlan(planId: string): Promise<void> {
    await api.delete(`/installment-settings/plans/${planId}`);
  }
}