"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { Check, ExternalLink, Flag, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import { useNoticeAction, useNotices } from "@/hooks/useNotices";
import type { Notice, NoticeStatus, Paginated } from "@/types/Notice";
import { ConfidenceBadge, NoticeStatusBadge, formatDateTime, humanize } from "./NoticeBadges";

const ALL = "__all__";

export default function NoticesTable({ status }: { status?: NoticeStatus }) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState(ALL);
  const [statusFilter, setStatusFilter] = useState(ALL);
  const action = useNoticeAction();

  const { data, isLoading, isError, error, refetch } = useNotices({
    page,
    per_page: 20,
    q: search || undefined,
    status: status ?? (statusFilter === ALL ? undefined : statusFilter),
    category: category === ALL ? undefined : category,
  });
  const result: Paginated<Notice> | undefined = data?.data;
  const items = result?.data ?? [];

  const onSearch = useCallback((value: string) => {
    setSearch(value);
    setPage(1);
  }, []);

  const columns: ColumnDef<Notice>[] = useMemo(
    () => [
      {
        id: "title",
        header: () => <div className="font-semibold text-gray-700">Notice</div>,
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="max-w-xl space-y-0.5">
              <Link href={`/notices/${n.id}`} className="font-medium text-gray-900 hover:text-green-700 hover:underline">
                {n.title_en || n.title_original}
              </Link>
              {n.title_en && <p className="line-clamp-1 text-xs text-muted-foreground">{n.title_original}</p>}
              <p className="text-xs text-muted-foreground">
                {n.organization}
                {n.enrichment_error && <span className="ml-2 text-red-600">· AI: {n.enrichment_error.slice(0, 80)}</span>}
                {!!n.open_reports_count && (
                  <span className="ml-2 inline-flex items-center gap-1 text-amber-700">
                    <Flag className="h-3 w-3" /> {n.open_reports_count} report(s)
                  </span>
                )}
              </p>
            </div>
          );
        },
      },
      {
        id: "type",
        header: () => <div className="font-semibold text-gray-700">Type</div>,
        cell: ({ row }) => (
          <div className="text-xs">
            <div className="font-medium">{humanize(row.original.category)}</div>
            <div className="text-muted-foreground">{humanize(row.original.notice_type)}</div>
          </div>
        ),
      },
      {
        id: "dates",
        header: () => <div className="font-semibold text-gray-700">Published</div>,
        cell: ({ row }) => (
          <div className="whitespace-nowrap text-xs">
            <div>{row.original.published_date_bs ?? "—"}</div>
            <div className="text-muted-foreground">fetched {formatDateTime(row.original.created_at)}</div>
          </div>
        ),
      },
      {
        id: "ai",
        header: () => <div className="font-semibold text-gray-700">AI</div>,
        cell: ({ row }) => <ConfidenceBadge value={row.original.ai_confidence} />,
      },
      {
        id: "status",
        header: () => <div className="font-semibold text-gray-700">Status</div>,
        cell: ({ row }) => <NoticeStatusBadge status={row.original.status} />,
      },
      {
        id: "actions",
        header: () => <div className="text-center font-semibold text-gray-700">Actions</div>,
        cell: ({ row }) => {
          const n = row.original;
          return (
            <div className="flex items-center justify-end gap-1">
              {n.status !== "published" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-green-200 text-green-700 hover:bg-green-50"
                  disabled={action.isPending}
                  title="Publish"
                  onClick={() => action.mutate({ id: n.id, action: "approve" })}
                >
                  <Check className="h-4 w-4" />
                </Button>
              )}
              {n.status !== "rejected" && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 border-red-200 text-red-600 hover:bg-red-50"
                  disabled={action.isPending}
                  title="Reject"
                  onClick={() => action.mutate({ id: n.id, action: "reject" })}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
              <Button asChild size="sm" variant="ghost" className="h-8" title="Official notice">
                <a href={n.source_url} target="_blank" rel="noopener noreferrer">
                  <ExternalLink className="h-4 w-4" />
                </a>
              </Button>
            </div>
          );
        },
      },
    ],
    [action],
  );

  const filters = (
    <div className="flex flex-wrap gap-2">
      <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1); }}>
        <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value={ALL}>All categories</SelectItem>
          <SelectItem value="loksewa">Loksewa</SelectItem>
          <SelectItem value="entrance">Entrance</SelectItem>
          <SelectItem value="license">License</SelectItem>
        </SelectContent>
      </Select>
      {!status && (
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="h-9 w-36"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value={ALL}>All statuses</SelectItem>
            {["pending", "published", "rejected", "archived"].map((s) => (
              <SelectItem key={s} value={s}>{humanize(s)}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}
    </div>
  );

  return (
    <ReusableDataTable<Notice, unknown>
      data={items}
      columns={columns}
      loading={isLoading}
      error={isError ? (error as any)?.message || "Failed to load notices" : null}
      onRetry={() => refetch()}
      extraActions={filters}
      enableSearch
      onSearchAction={onSearch}
      searchPlaceholder="Search title or organization"
      totalCount={result?.total ?? 0}
      pagination={{ page, totalPages: result?.last_page ?? 1, onPageChangeAction: setPage, dataCount: result?.total ?? 0 }}
      noDataText={status === "pending" ? "Review queue is empty 🎉" : "No notices"}
    />
  );
}
