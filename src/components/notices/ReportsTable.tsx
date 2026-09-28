"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useNoticeReports, useResolveReport } from "@/hooks/useNotices";
import type { NoticeReport, Paginated } from "@/types/Notice";
import { formatDateTime, humanize } from "./NoticeBadges";

export default function ReportsTable() {
  const { data, isLoading } = useNoticeReports({ per_page: 50 });
  const resolve = useResolveReport();
  const reports: NoticeReport[] = (data?.data as Paginated<NoticeReport> | undefined)?.data ?? [];

  if (isLoading) return <p className="p-4 text-sm text-muted-foreground">Loading…</p>;
  if (reports.length === 0) return <p className="p-4 text-sm text-muted-foreground">No open error reports.</p>;

  return (
    <div className="divide-y rounded-lg border">
      {reports.map((r) => (
        <div key={r.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <Link href={`/notices/${r.notice_id}`} className="font-medium hover:text-green-700 hover:underline">
              {r.notice?.title_en || r.notice?.title_original}
            </Link>
            <p className="text-sm">{r.message}</p>
            <p className="text-xs text-muted-foreground">
              {r.field ? `Field: ${humanize(r.field)} · ` : ""}
              {r.email ? `${r.email} · ` : ""}
              {formatDateTime(r.created_at)}
            </p>
          </div>
          <Button size="sm" variant="outline" disabled={resolve.isPending} onClick={() => resolve.mutate(r.id)}>
            Mark resolved
          </Button>
        </div>
      ))}
    </div>
  );
}
