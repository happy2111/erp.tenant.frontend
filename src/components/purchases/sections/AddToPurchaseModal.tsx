'use client';

import { useState, useEffect, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ProductVariant } from '@/schemas/product-variants.schema';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { PurchasesService } from '@/services/purchases.service';
import { AttributesService } from '@/services/attributes.service';
import { AttributeValuesService } from '@/services/attribute-values.service';
import { Attribute } from '@/schemas/attributes.schema';
import { PRODUCT_LABELS } from '@/lib/product-labels';
import { format } from 'date-fns';
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Minus,
  Plus,
  Package,
  ExternalLink,
  X,
  Truck,
  Calendar,
  Barcode,
  Tag,
  TrendingDown,
  History,
  Smartphone,
  Boxes,
  Hash,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { toast } from 'sonner';

type AddMode = 'variant' | 'instance';

type InstanceDraft = {
  key: string;
  serialNumber: string;
  price: string;
  discount: string;
  /** attributeId → attributeValueId */
  attrs: Record<string, string>;
};

const PurchaseTotalPanel = ({ total }: { total: number }) => (
  <div className="p-8 bg-primary/10 rounded-[2.5rem] border border-primary/20 flex justify-between items-center relative overflow-hidden">
    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent pointer-events-none" />
    <div className="flex flex-col relative z-10">
      <span className="text-[10px] font-black text-primary/60 uppercase tracking-[0.2em] leading-none mb-2 italic">
        JAMI TO‘LOV
      </span>
      <span className="text-5xl font-black text-primary tracking-tighter italic">
        {total.toLocaleString()}
      </span>
    </div>
    <Badge className="relative z-10 bg-primary text-white rounded-xl border-none font-black text-[9px] px-3 h-6 italic tracking-tighter">
      XARID
    </Badge>
  </div>
);

function emptyInstance(basePrice: number): InstanceDraft {
  return {
    key: crypto.randomUUID(),
    serialNumber: '',
    price: String(basePrice || ''),
    discount: '',
    attrs: {},
  };
}

interface Props {
  variant: ProductVariant | null;
  isOpen: boolean;
  onClose: () => void;
}

export function AddToPurchaseModal({ variant, isOpen, onClose }: Props) {
  const { addItem } = usePurchaseStore();
  const queryClient = useQueryClient();

  const [mode, setMode] = useState<AddMode>('variant');
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState(0);
  const [discount, setDiscount] = useState(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');
  const [instances, setInstances] = useState<InstanceDraft[]>([]);

  const [addValueAttrId, setAddValueAttrId] = useState<string | null>(null);
  const [newValueText, setNewValueText] = useState('');

  const { data: history } = useQuery({
    queryKey: ['variant-price-history', variant?.id],
    queryFn: () => PurchasesService.getPriceHistory(variant!.id, { limit: 3 }),
    enabled: isOpen && !!variant,
  });

  const { data: instanceAttrsData, isLoading: attrsLoading } = useQuery({
    queryKey: ['attributes', 'instance', 'purchase'],
    queryFn: () =>
      AttributesService.getAllAdmin({ isForInstance: true, limit: 100 }),
    enabled: isOpen && mode === 'instance',
  });

  const instanceAttrs = useMemo(
    () => instanceAttrsData?.items ?? [],
    [instanceAttrsData],
  );
  const requiredAttrs = useMemo(
    () => instanceAttrs.filter((a) => a.isRequired),
    [instanceAttrs],
  );

  useEffect(() => {
    if (variant && isOpen) {
      const base = Number(variant.defaultPrice) || 0;
      setPrice(base);
      setDiscount(0);
      setQuantity(1);
      setBatchNumber('');
      setExpiryDate('');
      setMode('variant');
      setInstances([emptyInstance(base)]);
      setAddValueAttrId(null);
      setNewValueText('');
    }
  }, [variant, isOpen]);

  // Количество namuna ↔ число карточек
  useEffect(() => {
    if (mode !== 'instance') return;
    setInstances((prev) => {
      if (prev.length === quantity) return prev;
      if (prev.length < quantity) {
        const extra = Array.from({ length: quantity - prev.length }, () =>
          emptyInstance(price),
        );
        return [...prev, ...extra];
      }
      return prev.slice(0, quantity);
    });
  }, [quantity, mode, price]);

  const createValueMutation = useMutation({
    mutationFn: ({ attributeId, value }: { attributeId: string; value: string }) =>
      AttributeValuesService.create({ attributeId, value }),
    onSuccess: (created, vars) => {
      queryClient.invalidateQueries({ queryKey: ['attributes', 'instance'] });
      setInstances((prev) =>
        prev.map((inst) => ({
          ...inst,
          attrs: {
            ...inst.attrs,
            // новое значение подставляем только в «текущую» карточку с пустым select —
            // проще: во все, где этот attr ещё не выбран
            [vars.attributeId]:
              inst.attrs[vars.attributeId] || created.id,
          },
        })),
      );
      toast.success('Qiymat qo‘shildi');
      setAddValueAttrId(null);
      setNewValueText('');
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message?.message ||
          err?.response?.data?.message ||
          'Qiymat yaratilmadi',
      );
    },
  });

  const instanceTotal = useMemo(() => {
    return instances.reduce((sum, inst) => {
      const p = Number(inst.price || price) || 0;
      const d = Number(inst.discount || 0) || 0;
      return sum + Math.max(0, p - d);
    }, 0);
  }, [instances, price]);

  const displayTotal =
    mode === 'instance' ? instanceTotal : (price - discount) * quantity;

  const updateInstance = (key: string, patch: Partial<InstanceDraft>) => {
    setInstances((prev) =>
      prev.map((inst) => (inst.key === key ? { ...inst, ...patch } : inst)),
    );
  };

  const setInstanceAttr = (
    key: string,
    attributeId: string,
    valueId: string,
  ) => {
    setInstances((prev) =>
      prev.map((inst) =>
        inst.key === key
          ? { ...inst, attrs: { ...inst.attrs, [attributeId]: valueId } }
          : inst,
      ),
    );
  };

  const handleConfirm = () => {
    if (!variant) return;

    if (mode === 'variant') {
      if (price < 0 || quantity <= 0) {
        toast.error('Narx va miqdorni to‘g‘ri kiriting');
        return;
      }
      if (discount > price) {
        toast.error('Chegirma narxdan katta bo‘lishi mumkin emas');
        return;
      }

      const result = addItem({
        productVariantId: variant.id,
        title: variant.title,
        sku: variant.sku || '',
        price,
        discount,
        quantity,
        total: (price - discount) * quantity,
        batchNumber: batchNumber || undefined,
        expiryDate: expiryDate || undefined,
      });

      if (!result.ok) {
        toast.error(result.error);
        return;
      }
      toast.success('Mahsulot xarid ro‘yxatiga qo‘shildi');
      onClose();
      return;
    }

    // ── Namuna mode ──
    for (const inst of instances) {
      if (!inst.serialNumber.trim()) {
        toast.error('Har bir namuna uchun serial kiriting');
        return;
      }
      const p = Number(inst.price || price);
      const d = Number(inst.discount || 0);
      if (!p || p <= 0) {
        toast.error(`Serial ${inst.serialNumber}: narx noto‘g‘ri`);
        return;
      }
      if (d > p) {
        toast.error(`Serial ${inst.serialNumber}: chegirma narxdan katta`);
        return;
      }
      for (const attr of requiredAttrs) {
        if (!inst.attrs[attr.id]) {
          toast.error(
            `Serial ${inst.serialNumber}: «${attr.name}» majburiy — tanlang`,
          );
          return;
        }
      }
    }

    const serials = instances.map((i) => i.serialNumber.trim().toLowerCase());
    if (new Set(serials).size !== serials.length) {
      toast.error('Serial raqamlar takrorlanmasligi kerak');
      return;
    }

    const payloadInstances = instances.map((inst) => {
      const attrIds = Object.values(inst.attrs).filter(Boolean);
      // Также необязательные, если выбраны
      return {
        serialNumber: inst.serialNumber.trim(),
        price: Number(inst.price || price),
        discount: Number(inst.discount || 0) || undefined,
        attributeValueIds: attrIds,
      };
    });

    const result = addItem({
      productVariantId: variant.id,
      title: variant.title,
      sku: variant.sku || '',
      price,
      discount,
      quantity: payloadInstances.length,
      total: instanceTotal,
      instances: payloadInstances,
    });

    if (!result.ok) {
      toast.error(result.error);
      return;
    }
    toast.success(`${payloadInstances.length} namuna savatga qo‘shildi`);
    onClose();
  };

  if (!variant) return null;

  const addValueAttr = instanceAttrs.find((a) => a.id === addValueAttrId);

  return (
    <>
      <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
        <DialogContent
          showCloseButton={false}
          className="sm:max-w-[640px] p-0 w-full overflow-hidden rounded-[3rem] border-none bg-card/95 backdrop-blur-3xl shadow-2xl"
        >
          <DialogClose asChild>
            <Button
              variant="ghost"
              className="absolute top-6 right-6 h-12 w-12 rounded-2xl bg-muted/50 hover:bg-destructive/10 hover:text-destructive transition-all z-50"
            >
              <X className="size-6 stroke-[3px]" />
            </Button>
          </DialogClose>

          <div className="p-8 sm:p-10 space-y-7 overflow-y-auto max-h-[90vh] custom-scrollbar">
            <DialogHeader>
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-primary/10 rounded-2xl text-primary">
                    <Truck size={24} />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase opacity-40 italic tracking-widest">
                      Omborga qabul qilish
                    </span>
                    <DialogTitle className="text-3xl font-black italic uppercase tracking-tighter leading-none flex items-center gap-2">
                      {variant.title}
                      <Link
                        href={`/product-variants/${variant.id}`}
                        className="opacity-20 hover:opacity-100 hover:text-primary transition-all"
                      >
                        <ExternalLink size={18} />
                      </Link>
                    </DialogTitle>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className="rounded-xl border-border/60 bg-muted/30 text-muted-foreground text-[10px] font-black uppercase px-3 h-7"
                >
                  SKU: {variant.sku || 'YO‘Q'}
                </Badge>
              </div>
            </DialogHeader>

            {/* Mode: Variant | Namuna */}
            <div className="flex p-1 bg-muted/40 rounded-2xl border border-border/40">
              {(
                [
                  {
                    key: 'variant' as const,
                    label: PRODUCT_LABELS.variant.short,
                    icon: Boxes,
                    hint: 'Oddiy miqdor',
                  },
                  {
                    key: 'instance' as const,
                    label: PRODUCT_LABELS.instance.short,
                    icon: Smartphone,
                    hint: 'Serial + xususiyat',
                  },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => setMode(opt.key)}
                  className={cn(
                    'flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-black uppercase tracking-wide transition-all',
                    mode === opt.key
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground',
                  )}
                >
                  <opt.icon className="size-4" />
                  {opt.label}
                </button>
              ))}
            </div>
            <p className="text-[10px] font-bold opacity-40 -mt-4 px-1">
              {mode === 'variant'
                ? 'Bir xil narxda donalab qabul qilish (partiya).'
                : 'Har bir qurilma alohida serial, narx va xususiyatlar bilan.'}
            </p>

            {/* Shared qty / base price */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1">
                  {mode === 'instance' ? 'Namunalar soni' : 'Miqdori (Soni)'}
                </Label>
                <div className="flex items-center justify-between bg-muted/30 rounded-[2rem] p-2 border-2 border-transparent">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-12 hover:bg-background"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    <Minus className="size-5 stroke-[3px]" />
                  </Button>
                  <span className="font-black text-3xl italic tracking-tighter">
                    {quantity}
                  </span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-2xl size-12 hover:bg-background"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    <Plus className="size-5 stroke-[3px]" />
                  </Button>
                </div>
              </div>

              <div className="space-y-4">
                <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1">
                  {mode === 'instance'
                    ? 'Asosiy narx (default)'
                    : 'Xarid narxi (Dona)'}
                </Label>
                <div className="relative group">
                  <Input
                    type="number"
                    className="h-16 rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-primary/30 focus:bg-background transition-all font-black text-2xl px-6"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                  />
                  <div className="absolute right-6 top-1/2 -translate-y-1/2 opacity-20">
                    <Package size={20} />
                  </div>
                </div>
              </div>
            </div>

            {mode === 'variant' && (
              <>
                <div className="space-y-4">
                  <div className="flex justify-between items-center px-1">
                    <Label className="text-[11px] font-black uppercase opacity-40 italic flex items-center gap-2">
                      <Tag size={13} /> Chegirma (Dona uchun summa)
                    </Label>
                    {discount > 0 && (
                      <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100">
                        Netto: {(price - discount).toLocaleString()}
                      </span>
                    )}
                  </div>
                  <div className="relative group">
                    <Input
                      type="number"
                      placeholder="0.00"
                      className="h-16 rounded-[2rem] bg-muted/30 border-2 border-transparent focus:border-emerald-500/30 focus:bg-background transition-all font-black text-2xl px-6 text-emerald-600"
                      value={discount === 0 ? '' : discount}
                      onChange={(e) => setDiscount(Number(e.target.value))}
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 text-emerald-500/30">
                      <TrendingDown size={22} />
                    </div>
                  </div>
                </div>

                {history && history.length > 0 && (
                  <div className="space-y-3">
                    <Label className="text-[11px] font-black uppercase opacity-40 italic flex items-center gap-2">
                      <History size={13} /> Oldin qanchaga olingan
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {history.map((h) => (
                        <button
                          key={`${h.purchaseId}-${h.batchNumber ?? ''}`}
                          type="button"
                          onClick={() => {
                            setPrice(h.price);
                            setDiscount(h.discount);
                          }}
                          className="px-4 py-2.5 rounded-2xl bg-muted/40 border border-border/40 hover:border-primary/40 transition-colors text-left"
                        >
                          <span className="block font-black text-sm">
                            {h.costPrice.toLocaleString()}
                            <span className="text-[9px] opacity-40 ml-1">
                              {h.currency?.symbol}
                            </span>
                          </span>
                          <span className="block text-[9px] font-bold opacity-40 uppercase">
                            {format(new Date(h.purchaseDate), 'dd.MM.yy')}
                            {h.supplier?.firstName
                              ? ` · ${h.supplier.firstName}`
                              : ''}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1 flex items-center gap-2">
                      <Barcode size={14} /> Partiya №
                    </Label>
                    <Input
                      placeholder="B-2024-001"
                      className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6"
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>
                  <div className="space-y-4">
                    <Label className="text-[11px] font-black uppercase opacity-40 italic ml-1 flex items-center gap-2">
                      <Calendar size={14} /> Yaroqlilik muddati
                    </Label>
                    <Input
                      type="date"
                      className="h-14 rounded-2xl bg-muted/30 border-none font-bold px-6"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            {mode === 'instance' && (
              <div className="space-y-4">
                {attrsLoading ? (
                  <div className="flex items-center justify-center py-8 text-muted-foreground gap-2">
                    <Loader2 className="size-5 animate-spin" />
                    <span className="text-sm font-bold">
                      Xususiyatlar yuklanmoqda…
                    </span>
                  </div>
                ) : requiredAttrs.length === 0 && instanceAttrs.length === 0 ? (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-[11px] font-bold text-amber-700">
                    Namuna xususiyatlari yo‘q. Avval «Xarakteristikalar →
                    Namunalar» bo‘limida yarating.
                  </div>
                ) : null}

                {instances.map((inst, idx) => (
                  <InstanceCard
                    key={inst.key}
                    index={idx}
                    inst={inst}
                    attrs={instanceAttrs}
                    requiredAttrs={requiredAttrs}
                    onChange={(patch) => updateInstance(inst.key, patch)}
                    onAttrChange={(attrId, valueId) =>
                      setInstanceAttr(inst.key, attrId, valueId)
                    }
                    onAddValue={(attrId) => {
                      setAddValueAttrId(attrId);
                      setNewValueText('');
                    }}
                  />
                ))}
              </div>
            )}

            <PurchaseTotalPanel total={displayTotal} />

            <Button
              className="w-full h-20 rounded-[2.5rem] text-xl font-black italic uppercase transition-all active:scale-[0.98]"
              disabled={price < 0 || quantity <= 0}
              onClick={handleConfirm}
            >
              <Plus className="mr-3 size-6 stroke-[4px]" />
              Xaridga qo‘shish
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline: yangi attribute value */}
      <Dialog
        open={!!addValueAttrId}
        onOpenChange={(open) => !open && setAddValueAttrId(null)}
      >
        <DialogContent className="rounded-[2rem] max-w-[400px]">
          <DialogHeader>
            <DialogTitle>
              Yangi qiymat
              {addValueAttr ? ` — ${addValueAttr.name}` : ''}
            </DialogTitle>
          </DialogHeader>
          <div className="py-2">
            <Input
              placeholder="Masalan: 70%, good…"
              value={newValueText}
              onChange={(e) => setNewValueText(e.target.value)}
              className="rounded-xl h-12"
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddValueAttrId(null)}>
              Bekor
            </Button>
            <Button
              disabled={!newValueText.trim() || createValueMutation.isPending}
              onClick={() => {
                if (!addValueAttrId) return;
                createValueMutation.mutate({
                  attributeId: addValueAttrId,
                  value: newValueText.trim(),
                });
              }}
            >
              {createValueMutation.isPending ? '…' : 'Saqlash'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

function InstanceCard({
  index,
  inst,
  attrs,
  requiredAttrs,
  onChange,
  onAttrChange,
  onAddValue,
}: {
  index: number;
  inst: InstanceDraft;
  attrs: Attribute[];
  requiredAttrs: Attribute[];
  onChange: (patch: Partial<InstanceDraft>) => void;
  onAttrChange: (attributeId: string, valueId: string) => void;
  onAddValue: (attributeId: string) => void;
}) {
  // Показываем обязательные первыми, затем остальные isForInstance
  const ordered = [
    ...requiredAttrs,
    ...attrs.filter((a) => !a.isRequired),
  ];

  return (
    <div className="rounded-[2rem] border border-border/50 bg-muted/20 p-5 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest opacity-40">
          Namuna #{index + 1}
        </span>
        <Badge variant="secondary" className="text-[9px] font-bold">
          {PRODUCT_LABELS.instance.short}
        </Badge>
      </div>

      <div className="space-y-2">
        <Label className="text-[10px] font-black uppercase opacity-40 flex items-center gap-1.5">
          <Hash size={12} /> Serial / IMEI
        </Label>
        <Input
          placeholder="SN-ABC-123456"
          className="h-12 rounded-2xl bg-background border-border/40 font-mono font-bold"
          value={inst.serialNumber}
          onChange={(e) => onChange({ serialNumber: e.target.value })}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40">
            Narx
          </Label>
          <Input
            type="number"
            className="h-12 rounded-2xl bg-background border-border/40 font-bold"
            value={inst.price}
            onChange={(e) => onChange({ price: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-[10px] font-black uppercase opacity-40">
            Chegirma
          </Label>
          <Input
            type="number"
            placeholder="0"
            className="h-12 rounded-2xl bg-background border-border/40 font-bold text-emerald-600"
            value={inst.discount}
            onChange={(e) => onChange({ discount: e.target.value })}
          />
        </div>
      </div>

      {ordered.length > 0 && (
        <div className="space-y-3 pt-1">
          <Label className="text-[10px] font-black uppercase opacity-40">
            Xususiyatlar
          </Label>
          {ordered.map((attr) => (
            <div key={attr.id} className="space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <span className="text-xs font-bold">
                  {attr.name}
                  {attr.isRequired && (
                    <span className="text-destructive ml-1">*</span>
                  )}
                </span>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-7 px-2 text-[10px] font-bold text-primary"
                  onClick={() => onAddValue(attr.id)}
                >
                  <Plus className="size-3 mr-1" />
                  Qiymat
                </Button>
              </div>
              <Select
                value={inst.attrs[attr.id] || undefined}
                onValueChange={(v) => onAttrChange(attr.id, v)}
              >
                <SelectTrigger className="h-11 rounded-xl bg-background">
                  <SelectValue placeholder="Tanlang…" />
                </SelectTrigger>
                <SelectContent>
                  {(attr.values ?? []).map((v) => (
                    <SelectItem key={v.id} value={v.id}>
                      {v.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
