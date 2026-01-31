export function ProductPrices({ prices }: { prices: any[] }) {
  return (
    <div className="bg-card/40 backdrop-blur-xl border border-border/50 rounded-[2rem] p-6 shadow-lg animate-in fade-in duration-1000">
      <h3 className="text-xs font-black uppercase tracking-[0.2em] mb-4 opacity-40">Narxlar</h3>
      <div className="space-y-3">
        {prices.length > 0 ? prices.map((price, idx) => (
          <div key={idx} className="flex justify-between items-center p-3 rounded-2xl bg-primary/5 border border-primary/10">
            <span className="text-xs font-bold opacity-70 italic">{price.type || 'Asosiy'}</span>
            <span className="text-lg font-black tracking-tighter italic">{price.amount} {price.currency}</span>
          </div>
        )) : (
          <div className="text-xs text-muted-foreground italic">Narxlar belgilanmagan</div>
        )}
      </div>
    </div>
  );
}