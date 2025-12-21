  import { CrudField } from "@/components/crud/types";
  import { Product } from "@/schemas/product.schema";
  import { Brand } from "@/schemas/brand.schema";

  export const productFields = (
    brands: Brand[]
  ): CrudField<Product>[] => [
    {
      name: "name",
      label: "Название товара",
    },
    {
      name: "code",
      label: "Код",
    },

    // 🔥 ВАЖНОЕ МЕСТО
    {
      name: "brand",
      label: "Бренд",
      render: (product) => product.brand?.name ?? "—",
    },

    // 👇 используется ТОЛЬКО в форме
    {
      name: "brandId",
      label: "Бренд",
      type: "select",
      options: brands.map((b) => ({
        label: b.name,
        value: b.id,
      })),
      hiddenInTable: true,
    },
  ];
