import { ProductVariant } from '@/schemas/product-variants.schema';
import { Badge } from '@/components/ui/badge';

interface Props {
  variant: ProductVariant;
}

export function ProductVariantInfo({ variant }: Props) {
  return (
    <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-6 animate-in slide-in-from-right-8 duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest">
            Variant
          </Badge>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-50">
            SKU: {variant.sku || '—'}
          </span>
          {variant.barcode && (
            <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-50">
              Barcode: {variant.barcode}
            </span>
          )}
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold tracking-tight leading-snug">
          {variant.title}
        </h1>
      </div>

      {/* Атрибуты в виде бейджей */}
      {variant.attributes.length > 0 && (
        <div className="flex flex-wrap gap-2 pt-2">
          {variant.attributes.map((attr, idx) => (
            <div
              key={idx}
              className="px-3 py-1.5 bg-background/60 rounded-xl border border-border/40 text-xs font-medium"
            >
              <span className="text-muted-foreground">{attr.name}:</span>{' '}
              <span className="font-semibold">{attr.value}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}