'use client';

import { useState } from 'react';
import { ProductImage } from '@/schemas/product-images.schema';
import { ProductImagesService } from '@/services/product-images.service';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2, Image as ImageIcon } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  initialImages: ProductImage[];
}


export function ProductGallery({ productId, initialImages }: Props) {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);

  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Используем опциональную цепочку ?. для поиска
  const [activeImage, setActiveImage] = useState<ProductImage | null>(
    images?.find((img) => img.isPrimary) || images?.[0] || null
  );


  // --- Загрузка изображения ---
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // Если это первое изображение, делаем его основным
      const isFirst = images.length === 0;
      const newImg = await ProductImagesService.uploadImage(productId, file, isFirst);

      const updatedList = [...images, newImg];
      setImages(updatedList);
      if (isFirst || !activeImage) setActiveImage(newImg);

      toast.success("Rasm muvaffaqiyatli yuklandi");
    } catch (error) {
      toast.error("Yuklashda xatolik yuz berdi");
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  };

  // --- Удаление изображения ---
  const handleDelete = async (e: React.MouseEvent, imageId: string) => {
    e.stopPropagation(); // Чтобы не срабатывал выбор фото
    setDeletingId(imageId);
    try {
      await ProductImagesService.deleteImage(imageId);
      const updatedList = images.filter((img) => img.id !== imageId);
      setImages(updatedList);

      // Если удалили активное фото, переключаем на первое доступное
      if (activeImage?.id === imageId) {
        setActiveImage(updatedList[0] || null);
      }
      toast.success("Rasm o'chirildi");
    } catch (error) {
      toast.error("O'chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in duration-700">
      {/* ГЛАВНОЕ ОКНО ПРОСМОТРА */}
      <div className="group relative aspect-square rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 shadow-2xl ring-1 ring-white/10">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt="Product"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center opacity-20 italic space-y-2">
            <ImageIcon className="size-12" />
            <span className="text-xs uppercase tracking-widest font-black">Rasm mavjud emas</span>
          </div>
        )}

        {/* Индикатор основного фото */}
        {activeImage?.isPrimary && (
          <div className="absolute top-6 left-6 px-3 py-1 rounded-full bg-primary/20 backdrop-blur-md border border-primary/30 text-[10px] font-black text-primary uppercase tracking-tighter">
            Asosiy
          </div>
        )}
      </div>

      {/* СПИСОК МИНИАТЮР И КНОПКА ДОБАВЛЕНИЯ */}
      <div className="flex gap-4 overflow-x-auto py-2 custom-scrollbar">
        {/* Кнопка добавления */}
        <label className={cn(
          "size-20 shrink-0 rounded-2xl flex flex-col items-center justify-center border-2 border-dashed border-border/50 bg-card/20 cursor-pointer transition-all hover:bg-primary/5 hover:border-primary/40",
          isUploading && "opacity-50 pointer-events-none"
        )}>
          {isUploading ? <Loader2 className="size-6 animate-spin text-primary" /> : <Plus className="size-6 text-muted-foreground" />}
          <span className="text-[8px] uppercase font-bold mt-1 text-muted-foreground">Qo'shish</span>
          <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={isUploading} />
        </label>

        {/* Список фото */}
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => setActiveImage(img)}
            className={cn(
              "group relative size-20 shrink-0 rounded-2xl overflow-hidden border transition-all cursor-pointer",
              activeImage?.id === img.id ? "border-primary ring-2 ring-primary/20 scale-95" : "border-border/50 opacity-60 hover:opacity-100"
            )}
          >
            <img src={img.url} className="w-full h-full object-cover" />

            {/* Кнопка удаления на миниатюре */}
            <button
              onClick={(e) => handleDelete(e, img.id)}
              className="absolute inset-0 bg-destructive/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              disabled={deletingId === img.id}
            >
              {deletingId === img.id ? (
                <Loader2 className="size-4 animate-spin text-white" />
              ) : (
                <Trash2 className="size-5 text-white" />
              )}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}