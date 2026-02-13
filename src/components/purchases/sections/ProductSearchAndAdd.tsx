'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { ProductVariantsService } from '@/services/product-variants.service';
import { usePurchaseStore } from '@/store/use-purchase-store';
import { Input } from '@/components/ui/input';
import { Search, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';

export function ProductSearchAndAdd() {
  const [search, setSearch] = useState('');
  const [selectedVariant, setSelectedVariant] = useState<any>(null);
  const [quantity, setQuantity] = useState(1);
  const [price, setPrice] = useState<number | ''>('');
  const [discount, setDiscount] = useState<number | ''>(0);
  const [batchNumber, setBatchNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('');

  const { addItem } = usePurchaseStore();

  const { data: variants, isLoading } = useQuery({
    queryKey: ['purchase-variants', search],
    queryFn: () =>
      ProductVariantsService.getAllAdmin({ search, limit: 30 }).then(
        (r) => r.items
      ),
  });

  const handleAdd = () => {
    if (!selectedVariant) return;
    if (!price || price <= 0) {
      toast.error('Укажите корректную цену');
      return;
    }

    addItem({
      productVariantId: selectedVariant.id,
      title: selectedVariant.title,
      sku: selectedVariant.sku,
      price: Number(price),
      discount: Number(discount) || 0,
      quantity: Number(quantity),
      total: Number(quantity) * Number(price),
      batchNumber: batchNumber || undefined,
      expiryDate: expiryDate || undefined,
    });

    toast.success('Товар добавлен в закупку');
    setSelectedVariant(null);
    setQuantity(1);
    setPrice('');
    setDiscount(0);
    setBatchNumber('');
    setExpiryDate('');
  };

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 size-5 opacity-50" />
        <Input
          placeholder="Поиск товара по названию или артикулу..."
          className="pl-12 h-12 rounded-2xl bg-background/70"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {isLoading ? (
          <div className="col-span-full text-center py-10">Загрузка...</div>
        ) : variants?.length ? (
          variants.map((v) => (
            <Dialog key={v.id}>
              <DialogTrigger asChild>
                <div
                  className="border rounded-2xl p-4 hover:bg-muted/50 transition-all cursor-pointer"
                  onClick={() => {
                    setSelectedVariant(v);
                    setPrice(v.defaultPurchasePrice || '');
                  }}
                >
                  <div className="font-medium">{v.title}</div>
                  <div className="text-sm text-muted-foreground">{v.sku}</div>
                  {v.defaultPurchasePrice && (
                    <div className="text-primary font-bold mt-1">
                      {Number(v.defaultPurchasePrice).toLocaleString()}
                    </div>
                  )}
                </div>
              </DialogTrigger>

              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>{v.title}</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
                  <div>
                    <Label>Количество</Label>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                    />
                  </div>

                  <div>
                    <Label>Цена закупки</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={price}
                      onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                    />
                  </div>

                  <div>
                    <Label>Скидка (опционально)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={discount}
                      onChange={(e) => setDiscount(e.target.value ? Number(e.target.value) : 0)}
                    />
                  </div>

                  <div>
                    <Label>Номер партии (опционально)</Label>
                    <Input
                      value={batchNumber}
                      onChange={(e) => setBatchNumber(e.target.value)}
                    />
                  </div>

                  <div>
                    <Label>Срок годности (опционально)</Label>
                    <Input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={() => setSelectedVariant(null)}>
                    Отмена
                  </Button>
                  <Button onClick={handleAdd}>
                    <Plus className="size-4 mr-2" />
                    Добавить
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          ))
        ) : (
          <div className="col-span-full text-center py-10 text-muted-foreground">
            Товары не найдены
          </div>
        )}
      </div>
    </div>
  );
}