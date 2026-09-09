"use client";

import { useMemo } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { UserX } from "lucide-react";
import { useGetAllBlockedUsers } from "@/hooks/use-forum";
import { ReusableDataTable } from "./ReusableDataTable";

interface ForumUser {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  image: string | null;
}

interface BlockedUserEntry {
  id: number;
  blocker: ForumUser;
  blocked: ForumUser;
}

function UserCell({ user }: { user: ForumUser }) {
  return (
    <div className="flex flex-col">
      <span className="text-sm font-medium text-gray-900">{user.name}</span>
      <span className="text-xs text-gray-500">{user.email}</span>
    </div>
  );
}

export default function BlockedUsersTable() {
  const { data, isLoading, isError, error } = useGetAllBlockedUsers();

  const items: BlockedUserEntry[] = data?.data ?? [];

  const columns: ColumnDef<BlockedUserEntry>[] = useMemo(
    () => [
      {
        id: "blocker",
        header: () => (
          <div className="flex items-center gap-2 font-semibold text-gray-700">
            <UserX className="h-4 w-4 text-red-500" />
            Blocked By
          </div>
        ),
        cell: ({ row }) => <UserCell user={row.original.blocker} />,
      },
      {
        id: "blocked",
        header: () => (
          <div className="font-semibold text-gray-700">Blocked User</div>
        ),
        cell: ({ row }) => <UserCell user={row.original.blocked} />,
      },
      {
        id: "blocker_phone",
        header: () => (
          <div className="font-semibold text-gray-700">Blocker Phone</div>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original.blocker?.phone || "—"}
          </span>
        ),
      },
      {
        id: "blocked_phone",
        header: () => (
          <div className="font-semibold text-gray-700">Blocked Phone</div>
        ),
        cell: ({ row }) => (
          <span className="text-sm text-gray-500">
            {row.original.blocked?.phone || "—"}
          </span>
        ),
      },
    ],
    [],
  );

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Failed to load blocked users
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReusableDataTable<BlockedUserEntry, any>
        data={items}
        columns={columns}
        loading={isLoading}
        enableSearch={false}
        enableSorting={false}
        totalCount={items.length}
        pagination={{
          page: 1,
          totalPages: 1,
          dataCount: items.length,
          onPageChangeAction: () => {},
        }}
      />
    </div>
  );
}
