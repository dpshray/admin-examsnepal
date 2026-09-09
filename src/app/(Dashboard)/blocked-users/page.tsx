"use client";

import PageHeader from "@/components/header/PageHeader";
import BlockedUsersTable from "@/components/table/BlockedUsersTable";
import { UserX } from "lucide-react";

export default function BlockedUsersPage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Blocked Users"
        icon={UserX}
        description="View users who have blocked other users on the forum."
      />
      <div className="mt-6">
        <BlockedUsersTable />
      </div>
    </div>
  );
}
