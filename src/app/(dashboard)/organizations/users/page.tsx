"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {useOrganizationUserStore} from "@/store/organization.user.store";
import {
  OrganizationUserFilters
} from "@/components/organization/users/OrganizationUserFilters";
import {
  OrganizationUserTable
} from "@/components/organization/users/OrganizationUserTable";
import {
  CreateOrganizationUserDialog
} from "@/components/organization/users/CreateOrganizationUserDialog";


export default function OrganizationUsersPage() {
  const { fetchUsers, users, loading } = useOrganizationUserStore();
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div className="p-4 space-y-4">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Organization Users</h1>
        <Button onClick={() => setCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Create User
        </Button>
      </div>

      <OrganizationUserFilters />

      <OrganizationUserTable
        users={users}
        loading={loading}
        onEdit={(id) => {
          setSelectedUserId(id);
          setEditDialogOpen(true);
        }}
        onDelete={(id) => {
          setSelectedUserId(id);
          setDeleteDialogOpen(true);
        }}
      />

      <CreateOrganizationUserDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
      />

      {/*{selectedUserId && (*/}
      {/*  <EditOrganizationUserDialog*/}
      {/*    open={editDialogOpen}*/}
      {/*    onOpenChange={setEditDialogOpen}*/}
      {/*    userId={selectedUserId}*/}
      {/*  />*/}
      {/*)}*/}

      {/*{selectedUserId && (*/}
      {/*  <DeleteOrganizationUserDialog*/}
      {/*    open={deleteDialogOpen}*/}
      {/*    onOpenChange={setDeleteDialogOpen}*/}
      {/*    userId={selectedUserId}*/}
      {/*  />*/}
      {/*)}*/}
    </div>
  );
}
