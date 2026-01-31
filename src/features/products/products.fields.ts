import { CrudField } from "@/components/crud/types";
import { Product } from "@/schemas/products.schema";

export const productFields: CrudField<Product>[] = [
  {
    name: "name",
    label: "Название товара",
    required: true,
    placeholder: "iPhone 14 Pro, Nike Air Max, Samsung Galaxy S23...",
  },
  {
    name: "code",
    label: "Артикул / Код",
    placeholder: "IPH14P128, NK-AM-42, SMS-GS23-BLK...",
  },
  {
    name: "brand.name",
    label: "Бренд",
    render: (row) => row.brand?.name || "—",
    hiddenInForm: true,
  },
  {
    name: "categories",
    label: "Категории",
    render: (row) =>
      row.categories?.map((c) => c.name).join(", ") || "—",
    hiddenInForm: true,
  },
  {
    name: "images.length",
    label: "Фото",
    hiddenInForm: true,
    render: (row) => row.images?.length || 0,
  },
  {
    name: "variants.length",
    label: "Вариантов",
    hiddenInForm: true,
    render: (row) => row.variants?.length || 0,
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