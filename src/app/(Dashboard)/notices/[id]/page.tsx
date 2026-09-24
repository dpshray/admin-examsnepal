"use client";

import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Check, ExternalLink, FileText, RefreshCw, Star, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import NoticeForm from "@/components/notices/NoticeForm";
import { ConfidenceBadge, NoticeStatusBadge, formatDateTime } from "@/components/notices/NoticeBadges";
import { useDeleteNotice, useNotice, useNoticeAction, useSaveNotice } from "@/hooks/useNotices";
import type { Notice } from "@/types/Notice";

export default function NoticeReviewPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data, isLoading } = useNotice(id);
  const notice: Notice | undefined = data?.data;
  const save = useSaveNotice();
  const action = useNoticeAction();
  const remove = useDeleteNotice();

  if (isLoading) return <p className="p-8 text-sm text-muted-foreground">Loading…</p>;
  if (!notice) return <p className="p-8 text-sm text-red-600">Notice not found.</p>;

  const files = notice.attachment_urls ?? [];

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/notices" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-gray-900">
          <ArrowLeft className="h-4 w-4" /> Notices
        </Link>
        <div className="flex flex-wrap items-center gap-2">
          <NoticeStatusBadge status={notice.status} />
          {notice.status !== "published" && (
            <Button size="sm" className="bg-green-600 hover:bg-green-700" disabled={action.isPending} onClick={() => action.mutate({ id: notice.id, action: "approve" })}>
              <Check className="h-4 w-4" /> Approve &amp; publish
            </Button>
          )}
          {notice.status !== "rejected" && (
            <Button size="sm" variant="outline" className="text-red-600" disabled={action.isPending} onClick={() => action.mutate({ id: notice.id, action: "reject" })}>
              <X className="h-4 w-4" /> Reject
            </Button>
          )}
          <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: notice.id, action: "feature" })}>
            <Star className={`h-4 w-4 ${notice.is_featured ? "fill-amber-400 text-amber-500" : ""}`} /> {notice.is_featured ? "Unfeature" : "Feature"}
          </Button>
          <Button size="sm" variant="outline" disabled={action.isPending} onClick={() => action.mutate({ id: notice.id, action: "re-enrich" })}>
            <RefreshCw className="h-4 w-4" /> Re-run AI
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="text-red-600"
            disabled={remove.isPending}
            onClick={() => {
              if (window.confirm("Delete this notice permanently? Rejecting keeps it for audit.")) {
                remove.mutate(notice.id, { onSuccess: () => router.push("/notices") });
              }
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        {/* Left: what the official site published + what the AI read */}
        <aside className="space-y-4">
          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">As published</p>
            <p className="mt-1 text-base font-medium leading-relaxed">{notice.title_original}</p>
            <p className="mt-2 text-xs text-muted-foreground">
              {notice.organization} · {notice.published_date_bs ?? "no date"} · via {notice.source?.name ?? "manual entry"}
            </p>
            <div className="mt-3 flex flex-col gap-1.5">
              <a href={notice.source_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm text-green-700 hover:underline">
                <ExternalLink className="h-4 w-4" /> Official notice page
              </a>
              {files.map((f) => (
                <a key={f.url} href={f.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 break-all text-sm text-green-700 hover:underline">
                  <FileText className="h-4 w-4 shrink-0" /> {f.name || f.url.split("/").pop()}
                </a>
              ))}
            </div>
          </div>

          {files.find((f) => /\.pdf(\?|$)/i.test(f.url)) && (
            <iframe
              title="PDF preview"
              src={files.find((f) => /\.pdf(\?|$)/i.test(f.url))!.url}
              className="h-[520px] w-full rounded-xl border bg-white"
            />
          )}

          <div className="rounded-xl border bg-card p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">AI extraction</p>
              <ConfidenceBadge value={notice.ai_confidence} />
            </div>
            {notice.enrichment_error && <p className="mt-2 rounded bg-red-50 p-2 text-xs text-red-700">{notice.enrichment_error}</p>}
            <p className="mt-2 text-xs text-muted-foreground">
              {notice.ai_model ?? "not run"}
              {notice.enriched_at && ` · ${formatDateTime(notice.enriched_at)}`}
              {notice.ai_input_tokens ? ` · ${notice.ai_input_tokens + (notice.ai_output_tokens ?? 0)} tokens` : ""}
            </p>
            {notice.ai_raw && (
              <pre className="mt-3 max-h-96 overflow-auto rounded-lg bg-gray-50 p-3 text-[11px] leading-relaxed">{JSON.stringify(notice.ai_raw, null, 2)}</pre>
            )}
          </div>

          {!!notice.reports?.length && (
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-amber-800">Reader reports</p>
              {notice.reports.map((r) => (
                <p key={r.id} className="mt-2 text-sm">
                  {r.is_resolved ? "✓ " : "• "}
                  {r.field && <strong>{r.field}: </strong>}
                  {r.message}
                </p>
              ))}
            </div>
          )}
        </aside>

        {/* Right: editable fields */}
        <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <NoticeForm notice={notice} submitting={save.isPending} onSubmit={(payload) => save.mutate({ id: notice.id, data: payload })} />
        </section>
      </div>
    </div>
  );
}
