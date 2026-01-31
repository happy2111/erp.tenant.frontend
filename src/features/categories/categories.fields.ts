// src/components/categories/categories.fields.ts
import { CrudField } from "@/components/crud/types";
import { Category } from "@/schemas/categories.schema";

export const categoryFields: CrudField<Category>[] = [
  {
    name: "name",
    label: "Название категории",
    required: true,
    placeholder: "Смартфоны, Ноутбуки, Аксессуары, Одежда...",
  },
  {
    name: "_count.products",
    label: "Товаров",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) => row._count?.products ?? row.products?.length ?? 0,
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      row.createdAt
        ? new Date(row.createdAt).toLocaleDateString("ru-RU", {
          day: "2-digit",
          month: "short",
          year: "numeric",
        })
        : "—",
  },
];