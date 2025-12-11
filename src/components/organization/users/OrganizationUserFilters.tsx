"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useOrganizationUserStore } from "@/store/organization.user.store";

export const OrganizationUserFilters = () => {
  const { fetchUsers } = useOrganizationUserStore();
  const [search, setSearch] = useState("");

  const handleSearch = () => {
    fetchUsers({ search });
  };

  return (
    <div className="flex space-x-2 mb-4">
      <Input
        placeholder="Search by name or position"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <Button onClick={handleSearch}>Search</Button>
    </div>
  );
};
