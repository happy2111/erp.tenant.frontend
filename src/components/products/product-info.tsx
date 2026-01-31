import { Product } from '@/schemas/products.schema';
import { Badge } from '@/components/ui/badge';

export function ProductInfo({ product }: { product: Product }) {
  return (
    <div className="bg-card/40 backdrop-blur-2xl border border-border/50 rounded-[2.5rem] p-8 md:p-10 shadow-xl space-y-6 animate-in slide-in-from-right-8 duration-700">
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="rounded-lg px-3 py-1 bg-primary/5 text-primary border-primary/20 text-[10px] uppercase font-black tracking-widest">
            {product.brand?.name || 'No Brand'}
          </Badge>
          <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-[0.3em] opacity-50">
            SKU: {product.code}
          </span>
        </div>
        <h1 className="text-4xl md:text-5xl font-black tracking-tighter italic uppercase italic leading-none">
          {product.name}
        </h1>
      </div>

      <div className="space-y-4">
        <p className="text-muted-foreground leading-relaxed font-medium">
          {product.description || "Ushbu mahsulot uchun tavsif mavjud emas."}
        </p>

        <div className="flex flex-wrap gap-2">
          {product.categories.map(cat => (
            <span key={cat.id} className="px-3 py-1.5 rounded-xl bg-background/50 border border-border/50 text-xs font-bold text-muted-foreground">
              # {cat.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}