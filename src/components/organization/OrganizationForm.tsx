"use client";

import React, { useEffect } from "react";
import { useForm, FieldPath } from "react-hook-form";
import { CreateOrganizationDto, UpdateOrganizationDto } from "@/schemas/organization.schema";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
type OrganizationFormValues = UpdateOrganizationDto;

type Props<T extends CreateOrganizationDto | UpdateOrganizationDto> = {
  initialValues?: Partial<T>;
  onSubmit: (values: Partial<T>) => Promise<void>;
  submitLabel?: string;
};

export function OrganizationForm<T extends CreateOrganizationDto | UpdateOrganizationDto>({
                                                                                            // Use the suggested fix: ensure initialValues is correctly typed
                                                                                            initialValues = {} as Partial<T>,
                                                                                            onSubmit,
                                                                                            submitLabel = "Saqlash",
                                                                                          }: Props<T>) {

  const formInitialValues = initialValues as OrganizationFormValues;

  const { register, handleSubmit, reset, formState } = useForm<OrganizationFormValues>({
    defaultValues: formInitialValues,
  });

  const { isSubmitting } = formState;

  useEffect(() => {
    reset(formInitialValues);
  }, [initialValues, reset]);

  const handleFormSubmit = async (values: OrganizationFormValues) => {
    await onSubmit(values as Partial<T>);
  };

  const nameField: FieldPath<OrganizationFormValues> = "name";
  const emailField: FieldPath<OrganizationFormValues> = "email";
  const phoneField: FieldPath<OrganizationFormValues> = "phone";
  const addressField: FieldPath<OrganizationFormValues> = "address";


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor={nameField}>Nomi</Label>
        <Input
          id={nameField}
          {...register(nameField, {
            required: "Organization name is required"
          })}
        />
      </div>

      <div>
        <Label htmlFor={emailField}>Email</Label>
        <Input id={emailField} {...register(emailField)} />
      </div>

      <div>
        <Label htmlFor={phoneField}>Telefon</Label>
        <Input id={phoneField} {...register(phoneField)} />
      </div>

      <div>
        <Label htmlFor={addressField}>Manzil</Label>
        <Input id={addressField} {...register(addressField)} />
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saqlanmoqda..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}