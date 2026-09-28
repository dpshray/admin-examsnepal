"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSaveSegment, useTagStudents } from "@/hooks/useMarketing";
import type { StudentFilters } from "@/types/Marketing";
import { fmtInt } from "./labels";

export function SaveSegmentDialog({
  open,
  onOpenChange,
  filters,
  count,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: StudentFilters;
  count: number;
}) {
  const [name, setName] = useState("");
  const save = useSaveSegment();
  // A saved segment can't reference another one.
  const rest = { ...filters, segment_id: undefined };
  const empty = Object.values(rest).every((v) => v === undefined || v === "");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Save as custom segment</DialogTitle>
          <DialogDescription>
            Saves the current filters (not a fixed list), so the segment updates as students change.
            It matches {fmtInt(count)} student{count === 1 ? "" : "s"} right now.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="segment-name">Name</Label>
          <Input id="segment-name" value={name} maxLength={100} onChange={(e) => setName(e.target.value)} placeholder="e.g. MDMS mock takers, not paid" />
          {empty && <p className="text-xs text-red-600">Pick at least one filter first.</p>}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button
            disabled={!name.trim() || empty || save.isPending}
            onClick={() => save.mutate({ name: name.trim(), filters: rest }, { onSuccess: () => { setName(""); onOpenChange(false); } })}
          >
            Save segment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function TagDialog({
  open,
  onOpenChange,
  selectedIds,
  filters,
  total,
  onDone,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedIds: number[];
  filters: StudentFilters;
  total: number;
  onDone: () => void;
}) {
  const [tag, setTag] = useState("");
  const tagStudents = useTagStudents();
  const scope = selectedIds.length ? `${fmtInt(selectedIds.length)} selected student${selectedIds.length === 1 ? "" : "s"}` : `all ${fmtInt(total)} matching students`;
  const valid = /^[\p{L}\p{N} _:-]{1,50}$/u.test(tag.trim());

  const run = (action: "add" | "remove") =>
    tagStudents.mutate(
      { tag: tag.trim(), action, ...(selectedIds.length ? { student_ids: selectedIds } : { filters }) },
      { onSuccess: () => { setTag(""); onDone(); onOpenChange(false); } },
    );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Manual tag</DialogTitle>
          <DialogDescription>Applies to {scope}.</DialogDescription>
        </DialogHeader>
        <div className="space-y-1.5">
          <Label htmlFor="tag-name">Tag</Label>
          <Input id="tag-name" value={tag} maxLength={50} onChange={(e) => setTag(e.target.value)} placeholder="e.g. called-by-sales" />
          <p className="text-xs text-muted-foreground">Letters, numbers, spaces, “-”, “_” and “:”.</p>
        </div>
        <DialogFooter className="gap-2">
          <Button variant="outline" disabled={!valid || tagStudents.isPending} onClick={() => run("remove")}>Remove tag</Button>
          <Button disabled={!valid || tagStudents.isPending} onClick={() => run("add")}>Add tag</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
