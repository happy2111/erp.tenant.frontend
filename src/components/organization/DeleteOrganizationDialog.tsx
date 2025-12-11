"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useOrganizationStore } from "@/store/organization.store";
import { toast } from "sonner";
import { Organization } from "@/schemas/organization.schema";

type Props = {
  open: boolean;
  id?: string;
  initialData?: Organization | null;
  onOpenChange: (open: boolean) => void;
};

export function DeleteOrganizationDialog({ open, id, initialData, onOpenChange }: Props) {
  const deleteOrganization = useOrganizationStore(s => s.deleteOrganization);

  const handleDelete = async () => {
    if (!id) return;
    const ok = await deleteOrganization(id);
    if (ok) {
      toast.success("Tashkilot o'chirildi");
      onOpenChange(false);
    } else {
      toast.error("O'chirishda xato");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>O'chirishni tasdiqlash</DialogTitle>
        </DialogHeader>

        <div className="py-4">
          <p>Haqiqatan ham <strong>{initialData?.name}</strong> tashkilotini o'chirmoqchimisiz?</p>
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Bekor qilish</Button>
          <Button variant="destructive" onClick={handleDelete}>O'chirish</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
