  import { CrudField } from "@/components/crud/types";
  import { Product } from "@/schemas/product.schema";
  import { Brand } from "@/schemas/brand.schema";

  export const productFields = (
    brands: Brand[]
  ): CrudField<Product>[] => [

    {
      name: "images",
      label: "Изображения",
      render: (row) =>
        row.images?.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img key={img.id} src={img.url} alt={img.alt!} className="w-10 h-10 object-cover rounded" />
      )),
    },
    {
      name: "name",
      label: "Название товара",
    },
    {
      name: "code",
      label: "Код",
    },
    {
      name: "brand",
      label: "Бренд",
      render: (product) => product.brand?.name ?? "—",
    },
    {
      name: "brandId",
      label: "Бренд",
      type: "select",
      options: brands.map((b) => ({
        label: b.name,
        value: b.id,
      })),
      hiddenInTable: true,
      hiddenInCard: true,
    },


  ];
