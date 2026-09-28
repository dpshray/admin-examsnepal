"use client";

import { useEffect, useRef, useState } from "react";
import { Braces, Send, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDebounce } from "@/hooks/use-Debounce";
import { useDeleteTemplate, useSaveTemplate, useSendTestTemplate } from "@/hooks/useMarketing";
import { marketingService } from "@/service/marketing.service";
import type { EmailTemplateRow, RenderedEmail, TemplateCategory } from "@/types/Marketing";

type Draft = Pick<EmailTemplateRow, "key" | "name" | "category" | "subject" | "preheader" | "html_body" | "text_body" | "cta_label" | "cta_path" | "is_active">;
type Field = "subject" | "preheader" | "html_body" | "cta_label";

export const EMPTY_TEMPLATE: Draft = {
  key: "",
  name: "",
  category: "lifecycle",
  subject: "",
  preheader: "",
  html_body: "<p>Hi {{first_name}},</p>\n<p></p>",
  text_body: null,
  cta_label: "",
  cta_path: "/student/dashboard",
  is_active: true,
};

const CATEGORY_HINT: Record<TemplateCategory, string> = {
  lifecycle: "Behaviour emails. Frequency caps, send windows and unsubscribe apply.",
  promotional: "Offers and upsells. Same rules as lifecycle.",
  transactional: "Service messages (payment problems). Skip caps and send windows; still skip bounced addresses.",
};

export default function TemplateEditor({
  template,
  variables,
  onSaved,
  onDeleted,
}: {
  template: EmailTemplateRow | null; // null = new
  variables: string[];
  onSaved: (key: string) => void;
  onDeleted: () => void;
}) {
  const [draft, setDraft] = useState<Draft>(template ?? EMPTY_TEMPLATE);
  const [studentId, setStudentId] = useState("");
  const [preview, setPreview] = useState<RenderedEmail | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const [focused, setFocused] = useState<Field>("html_body");
  const refs = useRef<Partial<Record<Field, HTMLInputElement | HTMLTextAreaElement | null>>>({});
  const save = useSaveTemplate();
  const del = useDeleteTemplate();
  const sendTest = useSendTestTemplate();

  useEffect(() => setDraft(template ?? EMPTY_TEMPLATE), [template]);

  // Live preview of the unsaved draft, rendered by the server with a real student's data.
  const debounced = useDebounce(JSON.stringify({ ...draft, studentId }), 600);
  useEffect(() => {
    const d = JSON.parse(debounced) as Draft & { studentId: string };
    if (!d.subject || !d.html_body) return;
    let cancelled = false;
    marketingService
      .previewDraft({ ...d, student_id: d.studentId ? Number(d.studentId) : undefined })
      .then((res: any) => { if (!cancelled) { setPreview(res.data); setPreviewError(null); } })
      .catch((e: any) => { if (!cancelled) setPreviewError(e?.message || "Preview failed"); });
    return () => { cancelled = true; };
  }, [debounced]);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const insertVariable = (name: string) => {
    const token = `{{${name}}}`;
    const el = refs.current[focused];
    const value = (draft[focused] ?? "") as string;
    const start = el?.selectionStart ?? value.length;
    const end = el?.selectionEnd ?? value.length;
    set({ [focused]: value.slice(0, start) + token + value.slice(end) } as Partial<Draft>);
    requestAnimationFrame(() => {
      el?.focus();
      el?.setSelectionRange(start + token.length, start + token.length);
    });
  };

  const isNew = !template;
  const usedBy = template?.used_by ?? [];

  return (
    <div className="grid gap-5 xl:grid-cols-2">
      <form
        className="space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          save.mutate({ key: isNew ? null : template!.key, data: draft }, { onSuccess: () => onSaved(draft.key) });
        }}
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="t-name">Name</Label>
            <Input id="t-name" value={draft.name} onChange={(e) => set({ name: e.target.value })} required maxLength={150} />
          </div>
          <div className="space-y-1">
            <Label htmlFor="t-key">Key</Label>
            <Input
              id="t-key"
              value={draft.key}
              disabled={!isNew}
              onChange={(e) => set({ key: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, "_") })}
              required
              maxLength={80}
              className="font-mono text-xs"
            />
          </div>
        </div>

        <div className="space-y-1">
          <Label>Category</Label>
          <Select value={draft.category} onValueChange={(v) => set({ category: v as TemplateCategory })}>
            <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
            <SelectContent>
              {(["lifecycle", "promotional", "transactional"] as TemplateCategory[]).map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
            </SelectContent>
          </Select>
          <p className="text-xs text-muted-foreground">{CATEGORY_HINT[draft.category]}</p>
        </div>

        <div className="flex items-end justify-between gap-2">
          <p className="text-xs text-muted-foreground">
            Click a field, then insert a variable. Variables are filled with each student&apos;s data and escaped safely.
          </p>
          <Popover>
            <PopoverTrigger asChild>
              <Button type="button" variant="outline" size="sm" className="h-8 shrink-0 gap-1 text-xs"><Braces className="h-3.5 w-3.5" /> Insert variable</Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="max-h-72 w-64 overflow-y-auto p-1">
              {variables.map((v) => (
                <button key={v} type="button" onClick={() => insertVariable(v)} className="block w-full rounded px-2 py-1 text-left font-mono text-xs hover:bg-muted">
                  {`{{${v}}}`}
                </button>
              ))}
            </PopoverContent>
          </Popover>
        </div>

        <div className="space-y-1">
          <Label htmlFor="t-subject">Subject</Label>
          <Input id="t-subject" ref={(el) => { refs.current.subject = el; }} onFocus={() => setFocused("subject")}
            value={draft.subject} onChange={(e) => set({ subject: e.target.value })} required maxLength={200} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t-pre">Preheader <span className="font-normal text-muted-foreground">(inbox preview text)</span></Label>
          <Input id="t-pre" ref={(el) => { refs.current.preheader = el; }} onFocus={() => setFocused("preheader")}
            value={draft.preheader ?? ""} onChange={(e) => set({ preheader: e.target.value })} maxLength={200} />
        </div>
        <div className="space-y-1">
          <Label htmlFor="t-body">Body (HTML)</Label>
          <Textarea id="t-body" ref={(el) => { refs.current.html_body = el; }} onFocus={() => setFocused("html_body")}
            value={draft.html_body} onChange={(e) => set({ html_body: e.target.value })} required rows={12} className="font-mono text-xs" />
          <p className="text-xs text-muted-foreground">Use &lt;p&gt;, &lt;strong&gt;, &lt;a href&gt;, &lt;br&gt;. Links are click-tracked automatically.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="space-y-1">
            <Label htmlFor="t-cta">Button label</Label>
            <Input id="t-cta" ref={(el) => { refs.current.cta_label = el; }} onFocus={() => setFocused("cta_label")}
              value={draft.cta_label ?? ""} onChange={(e) => set({ cta_label: e.target.value })} maxLength={60} placeholder="One clear action" />
          </div>
          <div className="space-y-1">
            <Label htmlFor="t-path">Button links to</Label>
            <Input id="t-path" value={draft.cta_path ?? ""} onChange={(e) => set({ cta_path: e.target.value })} maxLength={255} className="font-mono text-xs" placeholder="/student/exams/mock-tests" />
          </div>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <Switch checked={draft.is_active} onCheckedChange={(v) => set({ is_active: v })} />
          Active (inactive templates are never sent)
        </label>

        <div className="flex flex-wrap items-center gap-2 border-t pt-4">
          <Button type="submit" disabled={save.isPending}>{isNew ? "Create template" : "Save changes"}</Button>
          {!isNew && (
            <Button type="button" variant="outline" className="gap-1.5" disabled={sendTest.isPending}
              onClick={() => sendTest.mutate({ key: template!.key, studentId: studentId ? Number(studentId) : undefined })}
              title="Sends the saved version to your admin email">
              <Send className="h-4 w-4" /> Send test to me
            </Button>
          )}
          {!isNew && (
            <Button type="button" variant="ghost" className="ml-auto gap-1.5 text-red-600 hover:text-red-700"
              disabled={del.isPending || usedBy.length > 0}
              title={usedBy.length ? `Used by: ${usedBy.join(", ")}` : undefined}
              onClick={() => del.mutate(template!.key, { onSuccess: onDeleted })}>
              <Trash2 className="h-4 w-4" /> Delete
            </Button>
          )}
        </div>
        {usedBy.length > 0 && <p className="text-xs text-muted-foreground">Used by automations: {usedBy.join(", ")}</p>}
      </form>

      <div className="space-y-2">
        <div className="flex items-end gap-2">
          <div className="flex-1 space-y-1">
            <Label htmlFor="t-student">Preview with student ID</Label>
            <Input id="t-student" type="number" min={1} value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="Blank = most active student" className="h-8 text-xs" />
          </div>
          {preview && <span className="pb-2 text-xs text-muted-foreground">student #{preview.student_id}</span>}
        </div>
        {previewError && <p className="text-xs text-red-600">{previewError}</p>}
        <div className="overflow-hidden rounded-lg border">
          <div className="border-b bg-muted/40 px-3 py-2 text-xs">
            <div className="truncate font-medium text-gray-900">{preview?.subject || "Subject"}</div>
            <div className="truncate text-muted-foreground">{preview?.preheader}</div>
          </div>
          <iframe title="Email preview" sandbox="" srcDoc={preview?.html ?? ""} className="h-[560px] w-full bg-white" />
        </div>
      </div>
    </div>
  );
}
