import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { NoticeStatus } from "@/types/Notice";

const STATUS_STYLES: Record<NoticeStatus, string> = {
  pending: "bg-amber-100 text-amber-800 hover:bg-amber-100",
  published: "bg-green-100 text-green-700 hover:bg-green-100",
  rejected: "bg-red-100 text-red-700 hover:bg-red-100",
  archived: "bg-gray-100 text-gray-600 hover:bg-gray-100",
};

export function NoticeStatusBadge({ status }: { status: NoticeStatus }) {
  return <Badge className={cn("capitalize", STATUS_STYLES[status])}>{status}</Badge>;
}

export function ConfidenceBadge({ value }: { value: number | null }) {
  if (value === null || value === undefined) {
    return <span className="text-xs text-muted-foreground">—</span>;
  }
  const style = value >= 0.8 ? "bg-green-50 text-green-700" : value >= 0.6 ? "bg-amber-50 text-amber-700" : "bg-red-50 text-red-700";
  return <Badge className={cn("hover:bg-inherit", style)}>{Math.round(value * 100)}%</Badge>;
}

export function HealthBadge({ healthy, active, manual }: { healthy?: boolean; active: boolean; manual: boolean }) {
  if (!active) return <Badge className="bg-gray-100 text-gray-500 hover:bg-gray-100">Inactive</Badge>;
  if (manual) return <Badge className="bg-blue-50 text-blue-700 hover:bg-blue-50">Manual</Badge>;
  return healthy ? (
    <Badge className="bg-green-100 text-green-700 hover:bg-green-100">Healthy</Badge>
  ) : (
    <Badge className="bg-red-100 text-red-700 hover:bg-red-100">Unhealthy</Badge>
  );
}

export const humanize = (value?: string | null) => (value ? value.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "—");

export function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  return isNaN(d.getTime()) ? value : d.toLocaleString("en-GB", { dateStyle: "medium", timeStyle: "short" });
}
