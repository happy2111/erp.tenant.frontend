'use client';

import { useState } from 'react';
import { ProductImage } from '@/schemas/product-images.schema';
import { ProductImagesService } from '@/services/product-images.service';
import { Button } from '@/components/ui/button';
import {
  Plus,
  Trash2,
  Loader2,
  Image as ImageIcon,
  Pencil,
  Check
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface Props {
  productId: string;
  initialImages: ProductImage[];
}

export function ProductGallery({ productId, initialImages }: Props) {
  const [images, setImages] = useState<ProductImage[]>(initialImages || []);
  const [activeImage, setActiveImage] = useState<ProductImage | null>(
    images.find((img) => img.isPrimary) || images[0] || null
  );

  const [editMode, setEditMode] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  /* ---------- Upload ---------- */
  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const isFirst = images.length === 0;
      const newImg = await ProductImagesService.uploadImage(productId, file, isFirst);

      const updated = [...images, newImg];
      setImages(updated);
      if (isFirst || !activeImage) setActiveImage(newImg);

      toast.success("Rasm yuklandi");
    } catch {
      toast.error("Yuklashda xatolik");
    } finally {
      setIsUploading(false);
    }
  };

  /* ---------- Delete ---------- */
  const handleDelete = async (imageId: string) => {
    setDeletingId(imageId);
    try {
      await ProductImagesService.deleteImage(imageId);
      const updated = images.filter((img) => img.id !== imageId);
      setImages(updated);

      if (activeImage?.id === imageId) {
        setActiveImage(updated[0] || null);
      }

      toast.success("Rasm o‘chirildi");
    } catch {
      toast.error("O‘chirishda xatolik");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-5">
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold">Rasmlar</h3>

        <Button
          size="sm"
          variant={editMode ? 'default' : 'outline'}
          onClick={() => setEditMode((v) => !v)}
        >
          {editMode ? (<span className={"flex items-center"}><Check className="size-4 mr-1"/> Tayyor</span>) : (<span className={"flex items-center"}><Pencil className="size-4 mr-1" />Tahrirlash</span>)}
        </Button>
      </div>

      {/* MAIN IMAGE */}
      <div className="relative aspect-square rounded-[2.5rem] overflow-hidden bg-card/40 backdrop-blur-xl border border-border/50 shadow-xl">
        {activeImage ? (
          <img
            src={activeImage.url}
            alt="Product"
            className="w-full h-full object-cover transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground gap-2">
            <ImageIcon className="size-10 opacity-40" />
            <span className="text-xs uppercase font-bold opacity-40">
              Rasm mavjud emas
            </span>
          </div>
        )}

        {activeImage?.isPrimary && (
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-[10px] font-bold text-primary uppercase">
            Asosiy
          </div>
        )}
      </div>

      {/* THUMBNAILS */}
      <div className="flex gap-3 overflow-x-auto py-1">
        {/* ADD BUTTON (only edit mode) */}
        {editMode && (
          <label
            className={cn(
              "size-20 shrink-0 rounded-2xl flex flex-col items-center justify-center",
              "border-2 border-dashed border-border/50 bg-card/20 cursor-pointer",
              "transition-all hover:border-primary/40",
              isUploading && "opacity-50 pointer-events-none"
            )}
          >
            {isUploading ? (
              <Loader2 className="size-6 animate-spin text-primary" />
            ) : (
              <Plus className="size-6 text-muted-foreground" />
            )}
            <span className="text-[9px] font-bold uppercase mt-1 text-muted-foreground">
              Qo‘shish
            </span>
            <input
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleUpload}
              disabled={isUploading}
            />
          </label>
        )}

        {/* IMAGES */}
        {images.map((img) => (
          <div
            key={img.id}
            onClick={() => !editMode && setActiveImage(img)}
            className={cn(
              "relative size-20 shrink-0 rounded-2xl overflow-hidden border",
              "transition-all",
              activeImage?.id === img.id
                ? "border-primary ring-2 ring-primary/20"
                : "border-border/50",
              !editMode && "cursor-pointer"
            )}
          >
            <img src={img.url} className="w-full h-full object-cover" />

            {/* DELETE BUTTON (only edit mode) */}
            {editMode && (
              <button
                onClick={() => handleDelete(img.id)}
                disabled={deletingId === img.id}
                className="absolute top-1 right-1 size-6 rounded-full bg-destructive flex items-center justify-center"
              >
                {deletingId === img.id ? (
                  <Loader2 className="size-3 animate-spin text-white" />
                ) : (
                  <Trash2 className="size-3 text-white" />
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
