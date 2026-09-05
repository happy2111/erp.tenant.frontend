import api from '@/lib/axiosInstance';

export type PairingCreateResponse = {
  code: string;
  expiresAt: string;
  qrUrl: string;
};

interface ApiResponse<T> {
  success?: boolean;
  data: T;
  message?: string;
}

export class PhoneLinkService {
  static async createPairing(): Promise<PairingCreateResponse> {
    const res = await api.post<PairingCreateResponse | ApiResponse<PairingCreateResponse>>(
      '/tenant-auth/pairing/create',
    );

    const payload = res.data;
    if (payload && typeof payload === 'object' && 'data' in payload && payload.data) {
      return payload.data;
    }

    return payload as PairingCreateResponse;
  }
}
