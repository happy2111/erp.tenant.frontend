"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrganizationUserForm } from "./OrganizationUserForm";
import { useOrganizationUserStore } from "@/store/organization.user.store";
import {
  CreateOrgUserWithUserDto,
  CreateOrganizationUserWithUserSchema,
} from "@/schemas/organization.user.schema";
import { toast } from "sonner";
import { z } from "zod";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type FormInput = z.input<typeof CreateOrganizationUserWithUserSchema>;
type FormValues = Omit<FormInput, 'organizationId'>;

export const CreateOrganizationUserDialog = ({ open, onOpenChange }: Props) => {
  const createUserWithUser = useOrganizationUserStore((state) => state.createUserWithUser);
  const loading = useOrganizationUserStore((state) => state.loading);

  const handleSubmit = async (formData: FormValues) => {
    const organizationId = localStorage.getItem("selected_organization_id");

    if (!organizationId) {
      toast.error("Please select an organization before creating a user.");
      return;
    }


    const finalDto: CreateOrgUserWithUserDto = {
      ...formData,
      organizationId: organizationId,
    } as CreateOrgUserWithUserDto;

    const success = await createUserWithUser(finalDto);

    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Create New User and Assign to Organization</DialogTitle>
        </DialogHeader>
        <OrganizationUserForm
          onSubmit={handleSubmit}
          isLoading={loading}
        />
      </DialogContent>
    </Dialog>
  );
};