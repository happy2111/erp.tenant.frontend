"use client";

import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrganizationForm } from "./OrganizationForm";
import { useOrganizationStore } from "@/store/organization.store";
import { UpdateOrganizationDto, OrganizationWithUserRole } from "@/schemas/organization.schema";
import { toast } from "sonner";

type Props = {
  open: boolean;
  id?: string;
  initialData?: OrganizationWithUserRole | null;
  onOpenChange: (open: boolean) => void;
};

export function EditOrganizationDialog({ open, id, initialData, onOpenChange }: Props) {
  const updateOrganization = useOrganizationStore(s => s.updateOrganization);

  const handleSubmit = async (values: Partial<UpdateOrganizationDto>) => {
    if (!id) return;
    const res = await updateOrganization(id, values as UpdateOrganizationDto);
    if (res) {
      toast.success("Yangilandi");
      onOpenChange(false);
    } else {
      toast.error("Yangilashda xato");
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Tashkilotni tahrirlash</DialogTitle>
        </DialogHeader>

        <OrganizationForm initialValues={initialData ?? undefined} onSubmit={handleSubmit} submitLabel="Saqlash" />
      </DialogContent>
    </Dialog>
  );
}
