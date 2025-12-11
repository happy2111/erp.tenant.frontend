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

  // 2. Cast initialValues to the specific internal type for defaultValues
  const formInitialValues = initialValues as OrganizationFormValues;

  const { register, handleSubmit, reset, formState } = useForm<OrganizationFormValues>({
    // Use the concrete, non-generic type for RHF
    defaultValues: formInitialValues,
  });

  // Destructure the form state
  const { isSubmitting } = formState;

  useEffect(() => {
    // 3. Reset uses the concrete type. Dependency array is now safe.
    reset(formInitialValues);
    // We only reset when the initial data changes.
    // The cast is needed because the initialValues prop itself is still Partial<T>
  }, [initialValues, reset]);

  // 4. Handle form submission
  const handleFormSubmit = async (values: OrganizationFormValues) => {
    // Cast the internal form values back to the expected generic type for onSubmit
    await onSubmit(values as Partial<T>);
  };

  // 5. Use FieldPath for type-safe key registration
  // FieldPath ensures that only keys on OrganizationFormValues are used.
  const nameField: FieldPath<OrganizationFormValues> = "name";
  const emailField: FieldPath<OrganizationFormValues> = "email";
  const phoneField: FieldPath<OrganizationFormValues> = "phone";
  const addressField: FieldPath<OrganizationFormValues> = "address";


  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-4">
      <div>
        <Label htmlFor={nameField}>Nomi</Label>
        {/* Registration is now type-safe! */}
        <Input
          id={nameField}
          {...register(nameField, {
            required: "Organization name is required"
            // Note: If T is CreateOrganizationDto, "name" is required.
            // For updates, it's optional. You may need to refine the required rule.
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