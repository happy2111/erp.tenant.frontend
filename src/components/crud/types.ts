import { ZodSchema } from "zod";

export type CrudField<T> = {
  name: keyof T | string;
  label: string;

  type?: "text" | "number" | "select";
  options?: { label: string; value: string }[];

  hiddenInTable?: boolean;

  // 👇 ВАЖНО
  render?: (row: T) => React.ReactNode;
};



export interface CrudConfig<T, CreateDto, UpdateDto> {
  entityName: string;

  fields: CrudField<T>[];

  createSchema: ZodSchema<CreateDto>;
  updateSchema: ZodSchema<UpdateDto>;

  onCreate: (dto: CreateDto) => Promise<any>;
  onUpdate: (id: string, dto: UpdateDto) => Promise<any>;
  onDelete: (id: string) => Promise<void>;

  fetchOne?: (id: string) => Promise<T>;
}

export interface CrudPermissions {
  canCreate?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
}

export type CrudViewMode = "table" | "card";


