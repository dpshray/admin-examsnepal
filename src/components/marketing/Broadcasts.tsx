"use client";

import { useEffect, useMemo, useState } from "react";
import { Megaphone } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useDebounce } from "@/hooks/use-Debounce";
import { useBroadcasts, useCancelBroadcast, useCreateBroadcast, useEmailTemplates, useMarketingMeta } from "@/hooks/useMarketing";
import { marketingService } from "@/service/marketing.service";
import type { BroadcastPreview, BroadcastRow, EmailTemplateRow, MarketingMeta, StudentFilters } from "@/types/Marketing";
import { STAGE_LABELS, fmtDate, fmtInt } from "./labels";

const REASONS: Record<string, string> = {
  unsubscribed: "unsubscribed",
  suppressed_address: "bounced/blocked",
  no_email: "no valid email",
  unverified_inactive: "unverified & never active",
  frequency_cap: "emailed recently (cap)",
};

function describeFilters(f: StudentFilters, meta?: MarketingMeta) {
  const parts: string[] = [];
  if (f.segment_id) parts.push(`segment “${meta?.saved_segments.find((s) => String(s.id) === String(f.segment_id))?.name ?? f.segment_id}”`);
  if (f.stage) parts.push(f.stage.split(",").map((s) => STAGE_LABELS[s as keyof typeof STAGE_LABELS] ?? s).join(" / "));
  if (f.exam_type_id) parts.push(meta?.exam_types.find((t) => String(t.id) === String(f.exam_type_id))?.name ?? `exam ${f.exam_type_id}`);
  const rest = Object.keys(f).filter((k) => !["segment_id", "stage", "exam_type_id"].includes(k) && (f as any)[k]);
  if (rest.length) parts.push(`${rest.length} more filter${rest.length > 1 ? "s" : ""}`);
  return parts.join(" · ") || "—";
}

/** Create a one-off email to a segment. Also opened from the Students page with its current filters. */
export function NewBroadcastDialog({ open, onOpenChange, initialFilters }: { open: boolean; onOpenChange: (o: boolean) => void; initialFilters?: StudentFilters }) {
  const meta = useMarketingMeta();
  const metaData: MarketingMeta | undefined = meta.data?.data;
  const templates: EmailTemplateRow[] = (useEmailTemplates().data?.data?.templates ?? []).filter((t: EmailTemplateRow) => t.is_active && t.category !== "transactional");
  const create = useCreateBroadcast();
  const [name, setName] = useState("");
  const [templateKey, setTemplateKey] = useState("");
  const [filters, setFilters] = useState<StudentFilters>(initialFilters ?? {});
  const [when, setWhen] = useState("");
  const [preview, setPreview] = useState<BroadcastPreview | null>(null);

  useEffect(() => { if (open) { setFilters(initialFilters ?? {}); setPreview(null); } }, [open, initialFilters]);

  const key = useDebounce(JSON.stringify({ templateKey, filters }), 400);
  useEffect(() => {
    const { templateKey: t, filters: f } = JSON.parse(key);
    if (!open || !t || !Object.values(f).some(Boolean)) { setPreview(null); return; }
    marketingService.previewBroadcast(t, f).then((res: any) => setPreview(res.data)).catch(() => setPreview(null));
  }, [key, open]);

  const fromStudents = !!initialFilters && Object.values(initialFilters).some(Boolean);
  const hasAudience = Object.values(filters).some(Boolean);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>New broadcast</DialogTitle>
          <DialogDescription>A one-off email to a segment. It follows the same rules as automations: unsubscribes, bounces, frequency cap and send windows.</DialogDescription>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <Label htmlFor="b-name">Name (internal)</Label>
            <Input id="b-name" value={name} onChange={(e) => setName(e.target.value)} maxLength={150} placeholder="e.g. New MDMS mock series" />
          </div>
          <div className="space-y-1">
            <Label>Template</Label>
            <Select value={templateKey} onValueChange={setTemplateKey}>
              <SelectTrigger className="h-9"><SelectValue placeholder="Choose a template" /></SelectTrigger>
              <SelectContent>{templates.map((t) => <SelectItem key={t.key} value={t.key}>{t.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          {fromStudents ? (
            <p className="rounded-md bg-muted/40 px-3 py-2 text-xs">Audience: current Students-page filters ({describeFilters(filters, metaData)})</p>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label>Saved segment</Label>
                <Select value={filters.segment_id ?? ""} onValueChange={(v) => setFilters((f) => ({ ...f, segment_id: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>{(metaData?.saved_segments ?? []).map((s) => <SelectItem key={s.id} value={String(s.id)}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Target exam</Label>
                <Select value={filters.exam_type_id ?? ""} onValueChange={(v) => setFilters((f) => ({ ...f, exam_type_id: v }))}>
                  <SelectTrigger className="h-9 text-xs"><SelectValue placeholder="Any" /></SelectTrigger>
                  <SelectContent>{(metaData?.exam_types ?? []).map((t) => <SelectItem key={t.id} value={String(t.id)}>{t.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <Label htmlFor="b-when">Send at <span className="font-normal text-muted-foreground">(blank = next send window)</span></Label>
            <Input id="b-when" type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
          </div>
          {preview && (
            <div className="rounded-md border px-3 py-2 text-xs">
              <p><span className="font-semibold tabular-nums">{fmtInt(preview.would_send)}</span> of {fmtInt(preview.candidates)} matching students would get it right now.</p>
              {Object.keys(preview.skipped).length > 0 && (
                <p className="text-muted-foreground">Skipped: {Object.entries(preview.skipped).map(([k, n]) => `${fmtInt(n)} ${REASONS[k] ?? k}`).join(", ")}</p>
              )}
              {(preview.estimated_days ?? 0) > 1 && (
                <p className="text-amber-700">At the hourly limit this takes about {preview.estimated_days} days; messages not sent within 3 days are dropped.</p>
              )}
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name.trim() || !templateKey || !hasAudience || create.isPending || preview?.would_send === 0}
            onClick={() => create.mutate(
              { name: name.trim(), template_key: templateKey, filters, scheduled_for: when ? new Date(when).toISOString() : undefined },
              { onSuccess: () => { setName(""); onOpenChange(false); } },
            )}
          >
            Schedule broadcast
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function BroadcastsPanel() {
  const { data, isLoading } = useBroadcasts();
  const meta = useMarketingMeta();
  const cancel = useCancelBroadcast();
  const [open, setOpen] = useState(false);
  const rows: BroadcastRow[] = useMemo(() => data?.data ?? [], [data]);

  return (
    <div className="space-y-3">
      <div className="flex justify-between gap-2">
        <p className="text-xs text-muted-foreground">One-off emails to a segment. You can also start one from the Students page with the current filters.</p>
        <Button size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setOpen(true)}><Megaphone className="h-3.5 w-3.5" /> New broadcast</Button>
      </div>
      {isLoading ? <Skeleton className="h-32" /> : rows.length === 0 ? (
        <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">No broadcasts yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-lg border">
          <table className="w-full text-xs">
            <thead className="bg-muted/40 text-muted-foreground">
              <tr>
                <th className="px-3 py-2 text-left font-medium">Broadcast</th>
                <th className="px-3 py-2 text-left font-medium">Audience</th>
                <th className="px-3 py-2 text-left font-medium">When</th>
                <th className="px-3 py-2 text-right font-medium">Sent · queued</th>
                <th className="px-3 py-2 text-right font-medium">Opened · clicked</th>
                <th className="px-3 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {rows.map((b) => (
                <tr key={b.id}>
                  <td className="px-3 py-2">
                    <div className="font-medium text-gray-900">{b.name}</div>
                    <div className="text-muted-foreground">{b.template_key} <Badge variant="outline" className="ml-1 h-4 px-1 text-[10px]">{b.status}</Badge></div>
                  </td>
                  <td className="max-w-56 truncate px-3 py-2">{describeFilters(b.filters, meta.data?.data)}</td>
                  <td className="whitespace-nowrap px-3 py-2">{fmtDate(b.scheduled_for, true)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtInt(b.stats?.sent ?? 0)} · {fmtInt(b.stats?.queued ?? 0)}</td>
                  <td className="px-3 py-2 text-right tabular-nums">{fmtInt(b.stats?.opened ?? 0)} · {fmtInt(b.stats?.clicked ?? 0)}</td>
                  <td className="px-3 py-2 text-right">
                    {b.status !== "cancelled" && (b.status === "scheduled" || (b.stats?.queued ?? 0) > 0) && (
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-red-600" disabled={cancel.isPending} onClick={() => cancel.mutate(b.id)}>Cancel</Button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <NewBroadcastDialog open={open} onOpenChange={setOpen} />
    </div>
  );
}
