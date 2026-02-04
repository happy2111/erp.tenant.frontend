import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Package, ExternalLink, Hash } from 'lucide-react';

export default function ProductBreadcrumbHeader({ product }: { product: any }) {
  if (!product) return null;

  return (
    <Card className="bg-card/40 backdrop-blur-xl border-border/50 rounded-[2rem] overflow-hidden shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 gap-4">
        <div className="flex items-center gap-4 min-w-0">
          <div className="size-12 rounded-2xl bg-primary/10 flex items-center justify-center border border-primary/20 shrink-0">
            <Package className="size-6 text-primary" />
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-40">Asosiy Mahsulot</span>
              {product.code && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-muted text-[9px] font-mono font-bold border border-border/50">
                  <Hash className="size-2.5" />
                  {product.code}
                </div>
              )}
            </div>
            <h1 className="text-xl font-black tracking-tighter truncate italic uppercase italic">
              {product.name}
            </h1>
          </div>
        </div>

        <Link
          href={`/products/${product.id}`}
          className="group flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary/5 hover:bg-primary/10 border border-primary/10 transition-all text-xs font-bold uppercase tracking-wider"
        >
          Mahsulotni ko'rish
          <ExternalLink className="size-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
        </Link>
      </div>
    </Card>
  );
}