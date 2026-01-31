import { CrudField } from "@/components/crud/types";
import { Attribute } from "@/schemas/attributes.schema";

export const attributeFields: CrudField<Attribute>[] = [
  {
    name: "key",
    label: "Ключ (system name)",
    required: true,
    placeholder: "color, size, material, storage",
    helperText: "Используется в коде и API, только латиница, цифры, _ и -",
  },
  {
    name: "name",
    label: "Название для отображения",
    required: true,
    placeholder: "Цвет, Размер, Материал, Объём памяти",
  },
  {
    name: "values.length",
    label: "Значений",
    hiddenInForm: true,
    render: (row) => row.values?.length || 0,
  },
  {
    name: "createdAt",
    label: "Создано",
    hiddenInForm: true,
    hiddenInCard: true,
    render: (row) =>
      row.createdAt
        ? new Date(row.createdAt).toLocaleDateString("ru-RU")
        : "—",
  },
];