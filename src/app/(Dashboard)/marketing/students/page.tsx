"use client";

import { Suspense, useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowDown, ArrowRight, ArrowUp, ArrowUpDown, Download, Mail, Save, Tag, Trash2, Users } from "lucide-react";
import { toast } from "sonner";
import PageHeader from "@/components/header/PageHeader";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ReusableDataTable } from "@/components/table/ReusableDataTable";
import StudentFiltersPanel from "@/components/marketing/StudentFiltersPanel";
import StudentDrawer from "@/components/marketing/StudentDrawer";
import { SaveSegmentDialog, TagDialog } from "@/components/marketing/StudentBulkDialogs";
import { NewBroadcastDialog } from "@/components/marketing/Broadcasts";
import { STAGE_HINTS, STAGE_LABELS, SUBSCRIPTION_LABELS, fmtDate, fmtInt, fmtPct, relativeDays } from "@/components/marketing/labels";
import { useDeleteSegment, useMarketingMeta, useMarketingStudents } from "@/hooks/useMarketing";
import { marketingService } from "@/service/marketing.service";
import type { MarketingMeta, MarketingStudentRow, Paginated, ScoreTrend, StudentFilters } from "@/types/Marketing";

const FILTER_KEYS: (keyof StudentFilters)[] = [
  "search", "stage", "segment", "exam_type_id", "exam_type_taken", "attempts_min", "attempts_max",
  "score_min", "score_max", "inactive_days_min", "inactive_days_max", "subscription_status",
  "signed_up_from", "signed_up_to", "signup_source", "platform", "tag", "lead_min", "segment_id",
];

function TrendIcon({ trend }: { trend: ScoreTrend }) {
  if (trend === "improving") return <ArrowUp className="h-3.5 w-3.5 text-green-700" aria-label="Improving" />;
  if (trend === "declining") return <ArrowDown className="h-3.5 w-3.5 text-red-700" aria-label="Declining" />;
  if (trend === "flat") return <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" aria-label="Flat" />;
  return null;
}

function SortHeader({ label, column, sort, dir, onSort }: { label: string; column: string; sort: string; dir: string; onSort: (c: string) => void }) {
  const active = sort === column;
  const Icon = !active ? ArrowUpDown : dir === "asc" ? ArrowUp : ArrowDown;
  return (
    <button type="button" onClick={() => onSort(column)} className="inline-flex items-center gap-1 font-semibold text-gray-700 hover:text-gray-900">
      {label}
      <Icon className={`h-3 w-3 ${active ? "text-gray-900" : "text-gray-400"}`} />
    </button>
  );
}

function StudentsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  // Filters live in the URL so stage links from the overview and shared links work.
  const filters = useMemo(() => {
    const f: StudentFilters = {};
    FILTER_KEYS.forEach((k) => {
      const v = params.get(k);
      if (v) (f as Record<string, string>)[k] = v;
    });
    return f;
  }, [params]);
  const page = Number(params.get("page") ?? 1);
  const sort = params.get("sort") ?? "last_seen_at";
  const dir = params.get("dir") ?? "desc";

  const push = useCallback(
    (next: Record<string, string | number | undefined>) => {
      const qs = new URLSearchParams();
      Object.entries(next).forEach(([k, v]) => v !== undefined && v !== "" && qs.set(k, String(v)));
      router.replace(`${pathname}${qs.toString() ? `?${qs}` : ""}`, { scroll: false });
    },
    [pathname, router],
  );
  const setFilters = (f: StudentFilters) => { setSelected(new Set()); push({ ...f, sort, dir }); };
  const setPage = (p: number) => push({ ...filters, sort, dir, page: p });
  const onSort = (column: string) =>
    push({ ...filters, sort: column, dir: sort === column && dir === "desc" ? "asc" : "desc" });

  const meta = useMarketingMeta();
  const metaData: MarketingMeta | undefined = meta.data?.data;
  const { data, isLoading, isError, error, refetch } = useMarketingStudents({ ...filters, sort, dir, page, per_page: 25 });
  const result: Paginated<MarketingStudentRow> | undefined = data?.data;
  const rows = result?.data ?? [];
  const total = result?.total ?? 0;

  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [openId, setOpenId] = useState<number | null>(null);
  const [saveOpen, setSaveOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [broadcastOpen, setBroadcastOpen] = useState(false);
  const deleteSegment = useDeleteSegment();
  const currentSegment = metaData?.saved_segments.find((s) => String(s.id) === filters.segment_id);

  const toggle = (id: number) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  const allOnPage = rows.length > 0 && rows.every((r) => selected.has(r.student_id));

  const columns: ColumnDef<MarketingStudentRow>[] = [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={allOnPage}
          onCheckedChange={(v) =>
            setSelected((prev) => {
              const next = new Set(prev);
              rows.forEach((r) => (v ? next.add(r.student_id) : next.delete(r.student_id)));
              return next;
            })
          }
          aria-label="Select page"
        />
      ),
      cell: ({ row }) => (
        <Checkbox checked={selected.has(row.original.student_id)} onCheckedChange={() => toggle(row.original.student_id)} aria-label="Select student" />
      ),
    },
    {
      id: "student",
      header: () => <SortHeader label="Student" column="name" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <button type="button" onClick={() => setOpenId(s.student_id)} className="max-w-60 text-left">
            <span className="block truncate font-medium text-gray-900 hover:text-green-700 hover:underline">{s.name}</span>
            <span className="block truncate text-xs text-muted-foreground">{s.email}</span>
            {s.phone && <span className="block text-xs text-muted-foreground">{s.phone}</span>}
            {s.tags.length > 0 && (
              <span className="mt-0.5 flex flex-wrap gap-1">
                {s.tags.map((t) => <span key={t} className="rounded border border-dashed px-1 text-[10px] text-gray-600">#{t}</span>)}
              </span>
            )}
          </button>
        );
      },
    },
    {
      id: "exam",
      header: () => <div className="font-semibold text-gray-700">Target exam</div>,
      cell: ({ row }) => <div className="max-w-44 truncate text-xs" title={row.original.target_exam ?? ""}>{row.original.target_exam ?? "—"}</div>,
    },
    {
      id: "signed_up_at",
      header: () => <SortHeader label="Signed up" column="signed_up_at" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => <div className="whitespace-nowrap text-xs">{row.original.signed_up_at ? fmtDate(row.original.signed_up_at) : <span className="text-muted-foreground">Unknown</span>}</div>,
    },
    {
      id: "stage",
      header: () => <div className="font-semibold text-gray-700">Stage</div>,
      cell: ({ row }) => {
        const st = row.original.lifecycle_stage;
        return st ? <Badge variant="secondary" className="whitespace-nowrap font-normal" title={STAGE_HINTS[st]}>{STAGE_LABELS[st]}</Badge> : "—";
      },
    },
    {
      id: "total_attempts",
      header: () => <SortHeader label="Exams" column="total_attempts" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="text-xs tabular-nums">
            <div className="font-medium text-gray-900">{fmtInt(s.total_attempts)}</div>
            <div className="whitespace-nowrap text-muted-foreground" title="Free / Sprint / Mock">{s.free_attempts} / {s.sprint_attempts} / {s.mock_attempts}</div>
          </div>
        );
      },
    },
    {
      id: "avg_score_pct",
      header: () => <SortHeader label="Avg score" column="avg_score_pct" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => (
        <div className="inline-flex items-center gap-1 text-xs tabular-nums">
          {fmtPct(row.original.avg_score_pct, 0)}
          <TrendIcon trend={row.original.score_trend} />
        </div>
      ),
    },
    {
      id: "last_seen_at",
      header: () => <SortHeader label="Last active" column="last_seen_at" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => <div className="whitespace-nowrap text-xs">{relativeDays(row.original.last_seen_at)}</div>,
    },
    {
      id: "subscription",
      header: () => <SortHeader label="Subscription" column="subscription_ends_at" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="whitespace-nowrap text-xs">
            <div>{SUBSCRIPTION_LABELS[s.subscription_status]}</div>
            {s.subscription_ends_at && <div className="text-muted-foreground">{s.subscription_status === "expired" ? "ended" : "ends"} {fmtDate(s.subscription_ends_at)}</div>}
          </div>
        );
      },
    },
    {
      id: "lead_score",
      header: () => <SortHeader label="Lead" column="lead_score" sort={sort} dir={dir} onSort={onSort} />,
      cell: ({ row }) => {
        const v = row.original.lead_score;
        return (
          <div className="flex items-center gap-1.5" title="Upsell priority, 0–100 (open the student for the breakdown)">
            <div className="h-1.5 w-10 rounded-full bg-muted">
              <div className="h-1.5 rounded-full" style={{ width: `${v}%`, backgroundColor: "var(--viz-1)" }} />
            </div>
            <span className="text-xs tabular-nums">{v}</span>
          </div>
        );
      },
    },
  ];

  const exportCsv = async () => {
    setExporting(true);
    try {
      await marketingService.exportStudents(filters);
    } catch (e: any) {
      toast.error(e?.message || "Export failed");
    } finally {
      setExporting(false);
    }
  };

  const actions = (
    <div className="flex flex-wrap items-center gap-2">
      <span className="text-xs text-muted-foreground">
        {selected.size ? `${fmtInt(selected.size)} selected · ` : ""}{fmtInt(total)} matching
      </span>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setSaveOpen(true)}>
        <Save className="h-3.5 w-3.5" /> Save as segment
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setTagOpen(true)} disabled={!total}>
        <Tag className="h-3.5 w-3.5" /> Tag {selected.size ? "selected" : "all"}
      </Button>
      <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={exportCsv} disabled={exporting || !total}>
        <Download className="h-3.5 w-3.5" /> {exporting ? "Exporting…" : "Export CSV"}
      </Button>
      <Tooltip>
        <TooltipTrigger asChild>
          <span>
            <Button variant="outline" size="sm" className="h-8 gap-1.5 text-xs" onClick={() => setBroadcastOpen(true)}
              disabled={!total || !Object.values(filters).some(Boolean)}>
              <Mail className="h-3.5 w-3.5" /> Send email
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Broadcast to everyone matching these filters (apply at least one filter)</TooltipContent>
      </Tooltip>
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader icon={Users} title="Marketing · Students" description="Every student with their stage, exam activity, scores and subscription. Click a name for the full profile." />

      <StudentFiltersPanel filters={filters} meta={metaData} onChange={setFilters} />

      {currentSegment && (
        <div className="flex items-center justify-between rounded-lg border bg-muted/30 px-3 py-2 text-xs">
          <span>Showing saved segment <span className="font-medium text-gray-900">“{currentSegment.name}”</span></span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 gap-1 text-xs text-red-600 hover:text-red-700"
            disabled={deleteSegment.isPending}
            onClick={() => deleteSegment.mutate(currentSegment.id, { onSuccess: () => setFilters({ ...filters, segment_id: "" }) })}
          >
            <Trash2 className="h-3.5 w-3.5" /> Delete segment
          </Button>
        </div>
      )}

      <div className="viz-root rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <ReusableDataTable<MarketingStudentRow, unknown>
          data={rows}
          columns={columns}
          loading={isLoading}
          error={isError ? (error as any)?.message || "Failed to load students" : null}
          onRetry={() => refetch()}
          enableSearch={false}
          extraActions={actions}
          totalCount={total}
          pagination={{ page, totalPages: result?.last_page ?? 1, onPageChangeAction: setPage, dataCount: total }}
          noDataText="No students match these filters"
        />
      </div>

      <SaveSegmentDialog open={saveOpen} onOpenChange={setSaveOpen} filters={filters} count={total} />
      <TagDialog
        open={tagOpen}
        onOpenChange={setTagOpen}
        selectedIds={[...selected]}
        filters={filters}
        total={total}
        onDone={() => setSelected(new Set())}
      />
      <StudentDrawer studentId={openId} onClose={() => setOpenId(null)} />
      <NewBroadcastDialog open={broadcastOpen} onOpenChange={setBroadcastOpen} initialFilters={filters} />
    </div>
  );
}

export default function MarketingStudentsPage() {
  return (
    <Suspense>
      <StudentsPage />
    </Suspense>
  );
}
