import { Badge } from "@/components/ui/badge";
import { CrudField } from "@/components/crud/types";
import { Attribute } from "@/schemas/attributes.schema";
import { PRODUCT_LABELS } from "@/lib/product-labels";

export const attributeFields: CrudField<Attribute>[] = [
  {
    name: "key",
    label: "Kalit (tizim nomi)",
    required: true,
    placeholder: "color, size, battery_health",
    helperText: "Kod va API da ishlatiladi — faqat lotin harflari, raqamlar, _ va -",
  },
  {
    name: "name",
    label: "Ko‘rsatiladigan nom",
    required: true,
    placeholder: "Rang, O‘lcham, Batareya sig‘imi",
  },
  {
    name: "isRequired",
    label: "Majburiy",
    type: "boolean",
    helperText: "Variant/namuna yaratilganda maydonni to‘ldirish shart",
    render: (row) => (row.isRequired ? "Ha" : "Yo‘q"),
  },
  {
    name: "scope",
    label: "Qamrov",
    hiddenInForm: true,
    render: (row) => (
      <div className="flex flex-wrap gap-1">
        {row.isForVariant && (
          <Badge variant="secondary" className="text-[10px]">
            {PRODUCT_LABELS.variant.short}
          </Badge>
        )}
        {row.isForInstance && (
          <Badge variant="outline" className="text-[10px]">
            {PRODUCT_LABELS.instance.short}
          </Badge>
        )}
      </div>
    ),
  },
  {
    name: "values.length",
    label: "Qiymatlar",
    hiddenInForm: true,
    render: (row) => row.values?.length || 0,
  },
];
