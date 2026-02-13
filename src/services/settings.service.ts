import api from '@/lib/axiosInstance';
import {
  UpdateSettingsDto,
  Settings,
  SettingsSchema,
} from '@/schemas/settings.schema';

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class SettingsService {
  /**
   * Получить текущие настройки организации
   */
  static async getMySettings(): Promise<Settings> {
    const res = await api.get<ApiResponse<Settings>>('/settings/my');
    return SettingsSchema.parse(res.data.data);
  }

  /**
   * Обновить настройки организации
   */
  static async updateMySettings(dto: UpdateSettingsDto): Promise<Settings> {
    const res = await api.patch<ApiResponse<Settings>>('/settings/my', dto);
    return SettingsSchema.parse(res.data.data);
  }
}