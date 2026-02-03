import { ProductVariant } from '@/schemas/product-variants.schema';

interface Props {
  variant: ProductVariant;
}

export function ProductVariantPrice({ variant }: Props) {
  const hasPrice = variant.defaultPrice != null && variant.defaultPrice > 0;

  return (
    <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-6 shadow-xl space-y-4 animate-in fade-in duration-700 delay-100">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] opacity-40 italic px-2">
        Narx
      </h3>

      <div className="px-2">
        {hasPrice ? (
          <div className="text-3xl md:text-4xl font-bold tracking-tight">
            {variant.defaultPrice?.toLocaleString('ru-RU')}
            <span className="text-xl font-semibold ml-1 opacity-80">
              {variant.currency?.code || 'UZS'}
            </span>
          </div>
        ) : (
          <div className="text-xl text-muted-foreground font-medium">
            Narx kiritilmagan
          </div>
        )}
      </div>
    </div>
  );
}