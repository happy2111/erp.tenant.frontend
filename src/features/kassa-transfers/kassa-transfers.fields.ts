// src/components/kassa-transfers/kassa-transfers.fields.ts
import { CrudField } from "@/components/crud/types";
import { KassaTransfer } from "@/schemas/kassa-transfers.schema";

export const kassaTransferFields: CrudField<KassaTransfer>[] = [
  {
    name: "from_kassa.name",
    label: "Откуда (касса)",
    render: (row) => row.from_kassa?.name || row.fromKassaId || "—",
  },
  {
    name: "to_kassa.name",
    label: "Куда (касса)",
    render: (row) => row.to_kassa?.name || row.toKassaId || "—",
  },
  {
    name: "amount",
    label: "Сумма",
    render: (row) =>
      row.amount?.toLocaleString("ru-RU") +
      (row.from_currency?.code ? ` ${row.from_currency.code}` : ""),
  },
  {
    name: "rate",
    label: "Курс",
    render: (row) => (row.rate !== 1 ? row.rate?.toFixed(4) : "1.0000"),
  },
  {
    name: "convertedAmount",
    label: "Получено",
    render: (row) =>
      row.convertedAmount?.toLocaleString("ru-RU") +
      (row.to_currency?.code ? ` ${row.to_currency.code}` : ""),
  },
  {
    name: "description",
    label: "Комментарий",
    render: (row) => row.description || "—",
  },
  {
    name: "createdAt",
    label: "Дата",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      new Date(row.createdAt).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
];