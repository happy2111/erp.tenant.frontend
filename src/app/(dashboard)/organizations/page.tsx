"use client";

import {Dispatch, SetStateAction, useEffect, useMemo, useState} from "react";
import { useOrganizationStore } from "@/store/organization.store";
import { GetOrganizationsQueryDto } from "@/schemas/organization.schema";
import { Button } from "@/components/ui/button";
import {ColumnsPicker} from "@/components/organization/ColumnsPicker";
import {
  OrganizationsFilters
} from "@/components/organization/OrganizationsFilters";
import {OrganizationTable} from "@/components/organization/OrganizationTable";
import {
  CreateOrganizationDialog
} from "@/components/organization/CreateOrganizationDialog";
import {
  EditOrganizationDialog
} from "@/components/organization/EditOrganizationDialog";
import {
  DeleteOrganizationDialog
} from "@/components/organization/DeleteOrganizationDialog";
import {ArrowUpDown, ChevronDown} from "lucide-react";



export default function OrganizationsPage() {
  const fetchAllOrganizations = useOrganizationStore(s => s.fetchAllOrganizations);
  const allOrganizations = useOrganizationStore(s => s.allOrganizations);
  const loading = useOrganizationStore(s => s.loading);

  const [filters, setFilters] = useState<GetOrganizationsQueryDto>({
    search: null,
    order: "desc",
    sortField: "createdAt",
  });

  const [visibleColumns, setVisibleColumns] = useState({
    name: true,
    email: true,
    phone: true,
    address: true,
    createdAt: true,
    actions: true,
  });

  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [deleteOpen, setDeleteOpen] = useState<{ open: boolean; id?: string }>({ open: false });
  const [filterOpen, setFilterOpen] = useState(false);

  useEffect(() => {
    fetchAllOrganizations(filters);
  }, [filters, fetchAllOrganizations]);

  const selectedOrgForEdit = useMemo(() => {
    if (!editOpen.id) return null;
    return allOrganizations.find(o => o.id === editOpen.id) ?? null;
  }, [editOpen.id, allOrganizations]);

  const selectedOrgForDelete = useMemo(() => {
    if (!deleteOpen.id) return null;
    return allOrganizations.find(o => o.id === deleteOpen.id) ?? null;
  }, [deleteOpen.id, allOrganizations]);

  return (
    <div className="px-6 space-y-6">
      <div className="sm:flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Tashkilotlar</h1>
        <div className="flex flex-wrap items-center gap-3 max-sm:mt-3">
          <ColumnsPicker visible={visibleColumns} setVisible={setVisibleColumns} />
          <Button onClick={() => setCreateOpen(true)}>+ Tashkilot qo'shish</Button>
          <Button onClick={() => setFilterOpen(!filterOpen)} variant={"ghost"}>Filterlar <span style={{rotate: `${filterOpen ? "180deg" : ""}`}}><ChevronDown /></span></Button>
        </div>
      </div>

      {
        filterOpen && (<OrganizationsFilters filters={filters} setFilters={setFilters} />)
      }

      <OrganizationTable
        organizations={allOrganizations}
        loading={loading}
        visibleColumns={visibleColumns}
        onEdit={(id) => setEditOpen({ open: true, id })}
        onDelete={(id) => setDeleteOpen({ open: true, id })}
      />

      <CreateOrganizationDialog open={createOpen} onOpenChange={setCreateOpen} />

      <EditOrganizationDialog
        open={editOpen.open}
        id={editOpen.id}
        onOpenChange={(open) => setEditOpen({ ...editOpen, open })}
        initialData={selectedOrgForEdit}
      />

      <DeleteOrganizationDialog
        open={deleteOpen.open}
        id={deleteOpen.id}
        onOpenChange={(open) => setDeleteOpen({ ...deleteOpen, open })}
        initialData={selectedOrgForDelete}
      />
    </div>
  );
}
