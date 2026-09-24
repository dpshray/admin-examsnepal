"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FlaskConical, Pencil, Play, Radar } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import SourceFormDialog from "@/components/notices/SourceFormDialog";
import ParsedItemsTable from "@/components/notices/ParsedItemsTable";
import { HealthBadge, formatDateTime, humanize } from "@/components/notices/NoticeBadges";
import { useFetchNow, useNoticeSources, useTestFetch } from "@/hooks/useNotices";
import type { NoticeSource, ParsedItem } from "@/types/Notice";

export default function NoticeSourcesPage() {
  const [editing, setEditing] = useState<NoticeSource | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [preview, setPreview] = useState<{ source: NoticeSource; items: ParsedItem[] } | null>(null);
  const { data, isLoading } = useNoticeSources();
  const testFetch = useTestFetch();
  const fetchNow = useFetchNow();

  const sources: NoticeSource[] = useMemo(() => {
    const all: NoticeSource[] = data?.data ?? [];
    const q = search.toLowerCase();
    return q ? all.filter((s) => `${s.name} ${s.organization} ${s.list_url}`.toLowerCase().includes(q)) : all;
  }, [data, search]);

  const unhealthy = sources.filter((s) => s.is_active && s.fetch_type !== "manual" && s.is_healthy === false).length;

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={Radar}
        title="Notice sources"
        description="Official sites the notices pipeline reads. Sources are data: fix selectors here when a site changes, or switch it to manual."
        actionLabel="Add source"
        onAction={() => {
          setEditing(null);
          setFormOpen(true);
        }}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Input className="max-w-sm" placeholder="Search sources…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <p className="text-sm text-muted-foreground">
          {sources.length} sources · {unhealthy > 0 ? <span className="text-red-600">{unhealthy} unhealthy</span> : "all healthy"} ·{" "}
          <Link href="/notice-fetch-logs" className="text-green-700 hover:underline">fetch logs</Link>
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border bg-card shadow-sm">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-gray-50 text-xs text-gray-600">
            <tr>
              <th className="p-3">Source</th>
              <th className="p-3">Type</th>
              <th className="p-3">Health</th>
              <th className="p-3">Last success</th>
              <th className="p-3 text-right">Notices</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading && (
              <tr><td colSpan={6} className="p-6 text-center text-muted-foreground">Loading…</td></tr>
            )}
            {sources.map((s) => (
              <tr key={s.id} className="border-t align-top">
                <td className="p-3">
                  <p className="font-medium">{s.name}</p>
                  <a href={s.list_url} target="_blank" rel="noopener noreferrer" className="break-all text-xs text-muted-foreground hover:text-green-700">
                    {s.list_url.length > 80 ? `${s.list_url.slice(0, 80)}…` : s.list_url}
                  </a>
                  {s.last_error && <p className="mt-1 text-xs text-red-600">{s.last_error.slice(0, 160)}</p>}
                  {s.fetch_type === "manual" && s.notes && <p className="mt-1 text-xs text-blue-700">{s.notes}</p>}
                </td>
                <td className="p-3 text-xs">
                  <div>{humanize(s.category)}</div>
                  <div className="text-muted-foreground">{humanize(s.fetch_type)} · every {s.fetch_interval_minutes}m</div>
                </td>
                <td className="p-3">
                  <HealthBadge healthy={s.is_healthy} active={s.is_active} manual={s.fetch_type === "manual"} />
                  {(s.consecutive_failures > 0 || s.consecutive_empty_runs > 0) && (
                    <p className="mt-1 text-xs text-muted-foreground">
                      {s.consecutive_failures} fail · {s.consecutive_empty_runs} empty
                    </p>
                  )}
                </td>
                <td className="p-3 text-xs">
                  {formatDateTime(s.last_success_at)}
                  {s.last_item_count !== null && <div className="text-muted-foreground">{s.last_item_count} items</div>}
                </td>
                <td className="p-3 text-right text-xs">
                  {s.notices_count ?? 0}
                  {!!s.pending_count && <div className="text-amber-700">{s.pending_count} pending</div>}
                </td>
                <td className="p-3">
                  <div className="flex justify-end gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      title="Test fetch (no save)"
                      disabled={s.fetch_type === "manual" || testFetch.isPending}
                      onClick={() => testFetch.mutate({ id: s.id }, { onSuccess: (res: any) => setPreview({ source: s, items: res?.data ?? [] }) })}
                    >
                      <FlaskConical className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Fetch now" disabled={s.fetch_type === "manual" || !s.is_active || fetchNow.isPending} onClick={() => fetchNow.mutate(s.id)}>
                      <Play className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="outline" title="Edit" onClick={() => { setEditing(s); setFormOpen(true); }}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <SourceFormDialog open={formOpen} onOpenChange={setFormOpen} source={editing} />

      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>Test fetch · {preview?.source.name}</DialogTitle>
          </DialogHeader>
          {preview && <ParsedItemsTable items={preview.items} />}
        </DialogContent>
      </Dialog>
    </div>
  );
}
