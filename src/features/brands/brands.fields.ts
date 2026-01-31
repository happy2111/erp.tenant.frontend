import { CrudField } from "@/components/crud/types";
import { Brand } from "@/schemas/brands.schema";

export const brandFields: CrudField<Brand>[] = [
  {
    name: "name",
    label: "Название бренда",
    required: true,
    placeholder: "Например: Samsung, Nike, Adidas",
  },
  {
    name: "createdAt",
    label: "Создан",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) => new Date(row.createdAt).toLocaleDateString("ru-RU", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }),
  },
  {
    name: "_count.products",
    label: "Товаров",
    hiddenInForm: true,
    render: (row) => row._count?.products ?? row.products?.length ?? 0,
  },
  // Если захочешь показывать список товаров — можно добавить кастомный render,
  // но обычно для списка брендов достаточно количества
];