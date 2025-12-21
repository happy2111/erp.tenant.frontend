import { CrudField } from "@/components/crud/types";
import { Brand } from "@/schemas/brand.schema";

export const brandFields: CrudField<Brand>[] = [
  {
    name: "name",
    label: "Название бренда",
  },
];





