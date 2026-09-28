"use client";

import { useState } from "react";
import { History } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/components/notices/NoticeBadges";
import { useNoticeFetchLogs } from "@/hooks/useNotices";
import type { NoticeFetchLog, Paginated } from "@/types/Notice";

const STATUS_STYLES: Record<NoticeFetchLog["status"], string> = {
  running: "bg-blue-50 text-blue-700",
  success: "bg-green-100 text-green-700",
  empty: "bg-amber-100 text-amber-800",
  failed: "bg-red-100 text-red-700",
  skipped: "bg-gray-100 text-gray-600",
};

export default function NoticeFetchLogsPage() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useNoticeFetchLogs({ page, per_page: 50 });
  const result: Paginated<NoticeFetchLog> | undefined = data?.data;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader icon={History} title="Fetch logs" description="Every run of every notice source (refreshes every 30 seconds)." />

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[760px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="p-3">Started</th>
              <th className="p-3">Source</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Found</th>
              <th className="p-3 text-right">New</th>
              <th className="p-3">Error</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>}
            {result?.data.map((log) => (
              <tr key={log.id} className="border-t align-top">
                <td className="whitespace-nowrap p-3 text-xs">{formatDateTime(log.started_at)}</td>
                <td className="p-3">{log.source?.name ?? `#${log.source_id}`}</td>
                <td className="p-3"><Badge className={`capitalize hover:bg-inherit ${STATUS_STYLES[log.status]}`}>{log.status}</Badge></td>
                <td className="p-3 text-right">{log.items_found}</td>
                <td className="p-3 text-right">{log.items_new}</td>
                <td className="max-w-md p-3 text-xs text-red-600">{log.error?.slice(0, 240)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-end gap-2">
        <Button size="sm" variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
        <span className="text-sm text-muted-foreground">Page {result?.current_page ?? 1} of {result?.last_page ?? 1}</span>
        <Button size="sm" variant="outline" disabled={page >= (result?.last_page ?? 1)} onClick={() => setPage((p) => p + 1)}>Next</Button>
      </div>
    </div>
  );
}
