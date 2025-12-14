import {
  CreateCurrencyDto,
  UpdateCurrencyDto,
  Currency,
} from "@/schemas/currency.schema";
import api from "@/lib/axiosInstance";

export class CurrencyService {
  async create(dto: CreateCurrencyDto): Promise<Currency> {
    const res = await api.post("/currencies/create", dto);
    return res.data.data;
  }

  async findAll(): Promise<Currency[]> {
    const res = await api.get("/currencies/all");
    return res.data.data;
  }

  async findOne(id: string): Promise<Currency> {
    const res = await api.get(`/currencies/${id}`);
    return res.data.data;
  }

  async update(id: string, dto: UpdateCurrencyDto): Promise<Currency> {
    const res = await api.patch(`/currencies/update/${id}`, dto);
    return res.data.data;
  }

  async remove(id: string): Promise<void> {
    const res = await api.delete(`/currencies/remove/${id}`);
    return res.data.data;
  }
}

// Экспорт синглтона
export const currencyService = new CurrencyService();