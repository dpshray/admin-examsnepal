"use client";

import { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import { useSuppressionMutations, useSuppressions } from "@/hooks/useMarketing";
import type { Paginated, SuppressionRow } from "@/types/Marketing";
import { fmtDate } from "./labels";

const REASONS: Record<string, string> = {
  unsubscribed: "Unsubscribed",
  hard_bounce: "Bounced",
  complaint: "Marked as spam",
  manual: "Blocked by admin",
};

export default function SuppressionsPanel() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [email, setEmail] = useState("");
  const { data, isLoading, isError, refetch } = useSuppressions({ page, per_page: 25, q });
  const { add, remove } = useSuppressionMutations();
  const result: Paginated<SuppressionRow> | undefined = data?.data;
  const onSearch = useCallback((v: string) => { setQ(v); setPage(1); }, []);

  const columns: ColumnDef<SuppressionRow>[] = [
    { id: "email", header: () => <div className="font-semibold text-gray-700">Email</div>, cell: ({ row }) => <span className="text-xs">{row.original.email}</span> },
    {
      id: "reason",
      header: () => <div className="font-semibold text-gray-700">Reason</div>,
      cell: ({ row }) => (
        <div className="text-xs">
          <div>{REASONS[row.original.reason] ?? row.original.reason}</div>
          {row.original.detail && <div className="max-w-64 truncate text-muted-foreground" title={row.original.detail}>{row.original.detail}</div>}
        </div>
      ),
    },
    { id: "since", header: () => <div className="font-semibold text-gray-700">Since</div>, cell: ({ row }) => <span className="text-xs">{fmtDate(row.original.created_at)}</span> },
    {
      id: "actions",
      header: () => null,
      cell: ({ row }) => (
        <Button
          variant="ghost"
          size="sm"
          className="h-7 text-xs"
          disabled={remove.isPending}
          title={row.original.reason === "complaint" ? "They marked us as spam - only remove if they asked" : undefined}
          onClick={() => remove.mutate(row.original.id)}
        >
          Remove
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-foreground">
        These addresses never receive automation or broadcast emails. Bounces and spam complaints are added automatically from the info@ mailbox; unsubscribes from the email link.
      </p>
      <ReusableDataTable<SuppressionRow, unknown>
        data={result?.data ?? []}
        columns={columns}
        loading={isLoading}
        error={isError ? "Failed to load suppressions" : null}
        onRetry={() => refetch()}
        onSearchAction={onSearch}
        searchPlaceholder="Search email"
        extraActions={
          <form
            className="flex gap-2"
            onSubmit={(e) => { e.preventDefault(); if (email) add.mutate(email, { onSuccess: () => setEmail("") }); }}
          >
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Block an address" className="h-9 w-56 text-xs" />
            <Button type="submit" size="sm" variant="outline" className="h-9 text-xs" disabled={!email || add.isPending}>Block</Button>
          </form>
        }
        totalCount={result?.total ?? 0}
        pagination={{ page, totalPages: result?.last_page ?? 1, onPageChangeAction: setPage, dataCount: result?.total ?? 0 }}
        noDataText="No suppressed addresses"
      />
    </div>
  );
}
