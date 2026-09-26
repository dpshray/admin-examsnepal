"use client";

import { useCallback, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import { useSends } from "@/hooks/useMarketing";
import type { MessageLogRow, Paginated } from "@/types/Marketing";
import { fmtDate } from "./labels";

const ALL = "__all__";
const STATUSES = ["queued", "sent", "opened", "clicked", "bounced", "failed", "suppressed"];

export default function MessageLogPanel() {
  const [page, setPage] = useState(1);
  const [q, setQ] = useState("");
  const [status, setStatus] = useState(ALL);
  const { data, isLoading, isError, refetch } = useSends({ page, per_page: 25, q, status: status === ALL ? undefined : status });
  const result: Paginated<MessageLogRow> | undefined = data?.data;
  const onSearch = useCallback((v: string) => { setQ(v); setPage(1); }, []);

  const columns: ColumnDef<MessageLogRow>[] = [
    {
      id: "student",
      header: () => <div className="font-semibold text-gray-700">Student</div>,
      cell: ({ row }) => (
        <div className="max-w-52 text-xs">
          <div className="truncate font-medium text-gray-900">{row.original.name}</div>
          <div className="truncate text-muted-foreground">{row.original.email}</div>
        </div>
      ),
    },
    {
      id: "message",
      header: () => <div className="font-semibold text-gray-700">Message</div>,
      cell: ({ row }) => (
        <div className="max-w-72 text-xs">
          <div className="truncate text-gray-900">{row.original.subject ?? "—"}</div>
          <div className="text-muted-foreground">{row.original.automation_key ?? row.original.template_key}{row.original.variant === "B" ? " · variant B" : ""}</div>
        </div>
      ),
    },
    {
      id: "status",
      header: () => <div className="font-semibold text-gray-700">Status</div>,
      cell: ({ row }) => {
        const r = row.original;
        const warn = ["bounced", "failed", "suppressed"].includes(r.status);
        return (
          <div className="text-xs">
            <div className={warn ? "text-amber-700" : "text-gray-900"}>{r.status}</div>
            {r.suppress_reason && <div className="text-muted-foreground">{r.suppress_reason.replaceAll("_", " ")}</div>}
            {r.error && <div className="max-w-48 truncate text-red-700" title={r.error}>{r.error}</div>}
            {r.goal_met_at && <div className="text-green-700">goal met</div>}
          </div>
        );
      },
    },
    {
      id: "when",
      header: () => <div className="font-semibold text-gray-700">When</div>,
      cell: ({ row }) => (
        <div className="whitespace-nowrap text-xs">
          {row.original.sent_at ? `sent ${fmtDate(row.original.sent_at, true)}` : `due ${fmtDate(row.original.scheduled_for, true)}`}
        </div>
      ),
    },
  ];

  return (
    <ReusableDataTable<MessageLogRow, unknown>
      data={result?.data ?? []}
      columns={columns}
      loading={isLoading}
      error={isError ? "Failed to load messages" : null}
      onRetry={() => refetch()}
      onSearchAction={onSearch}
      searchPlaceholder="Search student name or email"
      extraActions={
        <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-36 text-xs"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
          </SelectContent>
        </Select>
      }
      totalCount={result?.total ?? 0}
      pagination={{ page, totalPages: result?.last_page ?? 1, onPageChangeAction: setPage, dataCount: result?.total ?? 0 }}
      noDataText="No messages yet"
    />
  );
}
