// src/components/purchases/purchases.fields.ts
import { CrudField } from "@/components/crud/types";
import { Purchase } from "@/schemas/purchases.schema";

export const purchaseFields: CrudField<Purchase>[] = [
  {
    name: "invoiceNumber",
    label: "Номер накладной",
    render: (row) => row.invoiceNumber || "—",
  },
  {
    name: "purchaseDate",
    label: "Дата закупки",
    render: (row) =>
      new Date(row.purchaseDate).toLocaleString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }),
  },
  {
    name: "supplier",
    label: "Поставщик",
    render: (row) =>
      row.supplier
        ? `${row.supplier.firstName || ""} ${row.supplier.lastName || ""} ${
          row.supplier.phone ? `(${row.supplier.phone})` : ""
        }`
        : "—",
  },
  {
    name: "totalAmount",
    label: "Сумма",
    render: (row) =>
      row.totalAmount?.toLocaleString("ru-RU") +
      (row.currency?.symbol ? ` ${row.currency.symbol}` : ""),
  },
  {
    name: "paidAmount",
    label: "Оплачено",
    render: (row) =>
      row.paidAmount?.toLocaleString("ru-RU") +
      (row.currency?.symbol ? ` ${row.currency.symbol}` : ""),
  },
  {
    name: "status",
    label: "Статус",
    render: (row) => {
      const statusMap: Record<string, { label: string; color: string }> = {
        DRAFT: { label: "Черновик", color: "text-yellow-600" },
        PARTIAL: { label: "Частично оплачено", color: "text-orange-600" },
        PAID: { label: "Оплачено", color: "text-green-600" },
        CANCELLED: { label: "Отменено", color: "text-red-600" },
      };
      const s = statusMap[row.status] || { label: row.status, color: "" };
      return <span className={s.color}>{s.label}</span>;
    },
  },
  {
    name: "kassa.name",
    label: "Касса",
    render: (row) => row.kassa?.name || "—",
  },
  {
    name: "items.length",
    label: "Позиций",
    render: (row) => row.items?.length || 0,
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      new Date(row.createdAt).toLocaleDateString("ru-RU", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
  },
];