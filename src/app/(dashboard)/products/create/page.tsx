'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowLeft,
  Search,
  Check,
  ChevronRight,
  Loader2,
  Tag
} from 'lucide-react';
import { useDebouncedCallback } from 'use-debounce'; // Используем твою библиотеку

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';

import { CreateProductSchema, CreateProductDto } from '@/schemas/products.schema';
import { ProductsService } from '@/services/products.service';
import { BrandsService } from '@/services/brands.service';
import { Brand } from '@/schemas/brands.schema';
import { toast } from 'sonner';

export default function CreateProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Состояния для поиска бренда
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isBrandsLoading, setIsBrandsLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CreateProductDto>({
    resolver: zodResolver(CreateProductSchema),
    defaultValues: {
      name: '',
      description: '',
      brandId: null,
    }
  });

  // --- Логика поиска через use-debounce ---
  const fetchBrands = async (search: string) => {
    setIsBrandsLoading(true);
    try {
      const data = await BrandsService.getAllAdmin({ search, limit: 10 });
      setBrands(data.items);
    } catch (error) {
      console.error('Error fetching brands:', error);
    } finally {
      setIsBrandsLoading(false);
    }
  };

  // Создаем дебаунс-функцию (задержка 500мс)
  const debouncedFetch = useDebouncedCallback((value: string) => {
    fetchBrands(value);
  }, 500);

  useEffect(() => {
    fetchBrands(''); // Первичная загрузка без задержки
  }, []);

  const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value); // Мгновенно обновляем UI инпута
    debouncedFetch(value);  // Откладываем запрос к API
  };

  const handleSelectBrand = (brand: Brand) => {
    setSelectedBrand(brand);
    setValue('brandId', brand.id);
    setIsDrawerOpen(false);
  };

  const onSubmit = async (data: CreateProductDto) => {
    setIsSubmitting(true);
    try {
      await ProductsService.create(data);
      toast.success('Mahsulot muvaffaqiyatli yaratildi');
      router.push('/products');
    } catch (error) {
      toast.error('Xatolik yuz berdi');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-4 md:p-8 relative overflow-hidden">
      {/* Декоративный фон */}
      <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />

      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="rounded-full">
            <ArrowLeft className="size-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Yangi mahsulot</h1>
            <p className="text-sm text-muted-foreground">Katalogga yangi tovar qo&apos;shish</p>
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div className="bg-card/40 backdrop-blur-md border border-border/50 rounded-[2.5rem] p-6 md:p-8 shadow-xl space-y-6">

            {/* Название */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Mahsulot nomi *</label>
              <Input
                {...register('name')}
                placeholder="Masalan: iPhone 15 Pro"
                className="h-12 rounded-xl bg-background/50 border-border/50"
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{errors.name.message}</p>}
            </div>

            {/* Описание */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Tavsif</label>
              <Textarea
                {...register('description')}
                placeholder="Batafsil ma'lumot..."
                className="min-h-[120px] rounded-xl bg-background/50 border-border/50 resize-none"
              />
            </div>

            {/* Выбор Бренда */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest opacity-60 ml-1">Brend</label>

              <Drawer open={isDrawerOpen} onOpenChange={setIsDrawerOpen}>
                <DrawerTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full h-12 justify-between rounded-xl border-border/50 bg-background/30"
                  >
                    <div className="flex items-center gap-2">
                      <Tag className="size-4 text-primary" />
                      {selectedBrand ? <span className="font-medium text-foreground">{selectedBrand.name}</span> : <span className="text-muted-foreground">Tanlanmagan</span>}
                    </div>
                    <ChevronRight className="size-4 opacity-50" />
                  </Button>
                </DrawerTrigger>

                <DrawerContent className="max-h-[85vh] p-0">
                  <div className="mx-auto w-full max-w-md pb-8">
                    <DrawerHeader className="border-b border-border/50 pb-6">
                      <DrawerTitle>Brend tanlash</DrawerTitle>
                      <DrawerDescription>Qidiruv orqali kerakli brendni toping</DrawerDescription>
                    </DrawerHeader>

                    <div className="p-4 space-y-4">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                        <Input
                          placeholder="Brend nomi..."
                          className="pl-10 h-11 rounded-xl bg-muted/50"
                          value={searchQuery}
                          onChange={onSearchChange}
                        />
                      </div>

                      <div className="space-y-1 h-[300px] overflow-y-auto custom-scrollbar">
                        {isBrandsLoading ? (
                          <div className="flex flex-col items-center justify-center py-20 opacity-40">
                            <Loader2 className="animate-spin size-6 mb-2" />
                            <span className="text-[10px] uppercase tracking-tighter">Yuklanmoqda...</span>
                          </div>
                        ) : brands.length > 0 ? (
                          brands.map((brand) => (
                            <button
                              key={brand.id}
                              type="button"
                              onClick={() => handleSelectBrand(brand)}
                              className="w-full flex items-center justify-between p-4 rounded-xl hover:bg-primary/10 transition-all text-left"
                            >
                              <span className="font-medium">{brand.name}</span>
                              {selectedBrand?.id === brand.id && <Check className="size-4 text-primary" />}
                            </button>
                          ))
                        ) : (
                          <div className="text-center py-20 text-muted-foreground text-sm italic">Topilmadi</div>
                        )}
                      </div>
                    </div>
                  </div>
                </DrawerContent>
              </Drawer>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/products')}
              className="flex-1 h-12 rounded-xl"
            >
              Bekor qilish
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 h-12 rounded-xl shadow-lg shadow-primary/20"
            >
              {isSubmitting ? <Loader2 className="animate-spin size-5" /> : 'Saqlash'}
            </Button>
          </div>
        </form>

        {isSubmitting && (
          <div className="pt-4 animate-in slide-in-from-bottom-2">
            <Progress value={90} className="h-1" />
          </div>
        )}
      </div>
    </div>
  );
}