"use client";

import { useEffect, useState } from "react";
import { FlaskConical } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useNoticeMeta, useSaveNoticeSource, useTestFetch } from "@/hooks/useNotices";
import type { NoticeMeta, NoticeSource, ParsedItem } from "@/types/Notice";
import { humanize } from "./NoticeBadges";
import ParsedItemsTable from "./ParsedItemsTable";

const SELECTOR_HELP: Record<string, string> = {
  html_list: '{"item": "table tbody tr", "link": "a", "link_attr": "href", "title": "td:nth-child(2)", "date": "td:first-child", "date_attr": null, "date_format": null, "skip_title": null, "limit": 40}',
  json_api: '{"items_path": "data.items", "title": "title", "title_alt": null, "date": "date_bs", "date_ad": null, "url_template": "https://example.gov.np/notice/{slug}", "attachments": {"path": "files", "url": "url", "name": "name"}}',
  rss: '{"skip_title": null, "limit": 40}',
  pdf_list: '{"container": "table", "limit": 10}',
  manual: "{}",
};

const empty = {
  name: "", organization: "", category: "loksewa", sub_category: "other", province: "", base_url: "", list_url: "",
  fetch_type: "html_list", selectors: "{}", language: "ne", fetch_interval_minutes: 180, is_active: true, is_trusted: true,
  verify_ssl: true, priority: 50, notes: "",
};

export default function SourceFormDialog({ open, onOpenChange, source }: { open: boolean; onOpenChange: (o: boolean) => void; source: NoticeSource | null }) {
  const [form, setForm] = useState(empty);
  const [jsonError, setJsonError] = useState<string | null>(null);
  const [preview, setPreview] = useState<ParsedItem[] | null>(null);
  const { data: metaRes } = useNoticeMeta();
  const meta: NoticeMeta | undefined = metaRes?.data;
  const save = useSaveNoticeSource();
  const test = useTestFetch();

  useEffect(() => {
    setPreview(null);
    setJsonError(null);
    setForm(
      source
        ? { ...empty, ...source, province: source.province ?? "", notes: source.notes ?? "", selectors: JSON.stringify(source.selectors ?? {}, null, 2) }
        : empty,
    );
  }, [source, open]);

  const set = (key: keyof typeof empty, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  const payload = () => {
    let selectors: unknown = {};
    try {
      selectors = JSON.parse(form.selectors || "{}");
      setJsonError(null);
    } catch {
      setJsonError("Selectors must be valid JSON");
      return null;
    }
    return { ...form, province: form.province || null, notes: form.notes || null, selectors, fetch_interval_minutes: Number(form.fetch_interval_minutes), priority: Number(form.priority) };
  };

  const runTest = () => {
    const data = payload();
    if (!data) return;
    setPreview(null);
    test.mutate({ id: source?.id ?? null, data }, { onSuccess: (res: any) => setPreview(res?.data ?? []) });
  };

  const submit = () => {
    const data = payload();
    if (!data) return;
    save.mutate({ id: source?.id, data }, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{source ? `Edit source #${source.id}` : "Add notice source"}</DialogTitle>
          <DialogDescription>Official sites only. Use “Test fetch” to check the selectors before saving — nothing is stored.</DialogDescription>
        </DialogHeader>

        <div className="grid gap-3 sm:grid-cols-2">
          {([
            ["name", "Name"],
            ["organization", "Organization"],
            ["base_url", "Base URL"],
            ["list_url", "List URL (page, feed or JSON endpoint)"],
          ] as const).map(([key, label]) => (
            <div key={key} className="space-y-1">
              <Label className="text-xs">{label}</Label>
              <Input value={String(form[key] ?? "")} onChange={(e) => set(key, e.target.value)} />
            </div>
          ))}

          <div className="space-y-1">
            <Label className="text-xs">Category</Label>
            <Select value={form.category} onValueChange={(v) => set("category", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta?.categories ?? []).map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Sub-category</Label>
            <Select value={form.sub_category} onValueChange={(v) => set("sub_category", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {(meta?.sub_categories?.[form.category as keyof NoticeMeta["sub_categories"]] ?? []).map((c) => (
                  <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fetch type</Label>
            <Select value={form.fetch_type} onValueChange={(v) => set("fetch_type", v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>{(meta?.fetch_types ?? []).map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Province (provincial PSCs)</Label>
            <Select value={form.province || "__none__"} onValueChange={(v) => set("province", v === "__none__" ? "" : v)}>
              <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">—</SelectItem>
                {(meta?.provinces ?? []).map((c) => <SelectItem key={c} value={c}>{humanize(c)}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Fetch every (minutes)</Label>
            <Input type="number" min={30} value={form.fetch_interval_minutes} onChange={(e) => set("fetch_interval_minutes", e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Priority (higher first)</Label>
            <Input type="number" min={0} value={form.priority} onChange={(e) => set("priority", e.target.value)} />
          </div>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Selectors (JSON)</Label>
          <Textarea rows={6} className="font-mono text-xs" value={form.selectors} onChange={(e) => set("selectors", e.target.value)} />
          <p className="text-[11px] text-muted-foreground break-all">Example for {humanize(form.fetch_type)}: {SELECTOR_HELP[form.fetch_type]}</p>
          {jsonError && <p className="text-xs text-red-600">{jsonError}</p>}
        </div>

        <div className="flex flex-wrap gap-6">
          {([
            ["is_active", "Active"],
            ["is_trusted", "Trusted (may auto-publish)"],
            ["verify_ssl", "Verify TLS certificate"],
          ] as const).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm">
              <Switch checked={Boolean(form[key])} onCheckedChange={(v) => set(key, v)} /> {label}
            </label>
          ))}
        </div>
        {!form.verify_ssl && (
          <p className="rounded-md bg-amber-50 p-2 text-xs text-amber-800">
            TLS verification off is logged on every request. Prefer adding the site’s missing intermediate certificate to backend/resources/certs/notices.
          </p>
        )}

        <div className="space-y-1">
          <Label className="text-xs">Notes</Label>
          <Textarea rows={2} value={form.notes} onChange={(e) => set("notes", e.target.value)} />
        </div>

        {preview && <ParsedItemsTable items={preview} />}

        <DialogFooter className="gap-2">
          <Button type="button" variant="outline" onClick={runTest} disabled={test.isPending || form.fetch_type === "manual"}>
            <FlaskConical className="h-4 w-4" /> {test.isPending ? "Fetching…" : "Test fetch"}
          </Button>
          <Button type="button" onClick={submit} disabled={save.isPending} className="bg-green-600 hover:bg-green-700">
            {save.isPending ? "Saving…" : "Save source"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
