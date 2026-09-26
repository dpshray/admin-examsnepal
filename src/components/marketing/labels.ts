import type { LifecycleStage, SubscriptionStatus } from "@/types/Marketing";

export const STAGE_LABELS: Record<LifecycleStage, string> = {
  expiring_soon: "Expiring soon",
  paid_active: "Paid · active",
  paid_inactive: "Paid · inactive",
  expired: "Expired",
  hot_lead: "Hot lead",
  new: "New",
  registered_inactive: "Registered, no exam",
  dormant: "Dormant",
  engaged_free: "Engaged free",
  free_only: "Free only",
  activated: "Activated",
};

export const STAGE_HINTS: Record<LifecycleStage, string> = {
  expiring_soon: "Subscription ends within 7 days",
  paid_active: "Active subscription, took an exam in the last 7 days",
  paid_inactive: "Active subscription, no exam in 7+ days",
  expired: "Paid before, subscription over, not renewed",
  hot_lead: "Never paid; lead score ≥ 60 or abandoned checkout in last 30 days",
  new: "Signed up < 24h ago, no exams",
  registered_inactive: "Signed up 24h+ ago, no exams",
  dormant: "Has exams, none in 21+ days, never paid",
  engaged_free: "Took a Sprint or Mock, never paid",
  free_only: "3+ exams, no Sprint/Mock, never paid",
  activated: "1–2 exams",
};

export const SUBSCRIPTION_LABELS: Record<SubscriptionStatus, string> = {
  never: "Never paid",
  active: "Active",
  expiring_soon: "Expiring soon",
  expired: "Expired",
};

export const SEGMENT_LABELS: Record<string, string> = {
  low_performer: "Low performer (<40%)",
  high_performer: "High performer (≥75%)",
  score_declining: "Score declining",
  score_improving: "Score improving",
  has_weak_subject: "Has weak subject",
  exam_date_near: "Exam within 30 days",
  checkout_abandoned: "Checkout abandoned",
  streak_active: "Streak active",
  streak_broken: "Streak broken",
  app_user: "App user",
  web_only: "Web only",
};

export const LEAD_REASON_LABELS: Record<string, string> = {
  recent_attempts: "Exams in last 14 days",
  took_sprint: "Took a Sprint",
  took_mock: "Took a Mock",
  viewed_pricing_7d: "Viewed pricing (7 days)",
  checkout_abandoned: "Abandoned checkout",
  exam_within_60d: "Exam date within 60 days",
  inactive_14d: "Inactive 14+ days",
};

export const EVENT_LABELS: Record<string, string> = {
  signed_up: "Signed up",
  logged_in: "Logged in",
  exam_started: "Started exam",
  exam_submitted: "Submitted exam",
  exam_abandoned: "Abandoned exam",
  pricing_viewed: "Viewed pricing",
  checkout_started: "Started checkout",
  payment_succeeded: "Payment succeeded",
  payment_failed: "Payment failed",
  subscription_expired: "Subscription expired",
  email_clicked: "Clicked email",
};

export function segmentLabel(key: string, examTypes?: { id: number; name: string }[]) {
  if (key.startsWith("exam:")) {
    const id = Number(key.slice(5));
    return `Exam: ${examTypes?.find((t) => t.id === id)?.name ?? `#${id}`}`;
  }
  return SEGMENT_LABELS[key] ?? key;
}

export const fmtInt = (n: number | null | undefined) => (n == null ? "—" : Math.round(n).toLocaleString("en-IN"));
export const fmtPct = (n: number | string | null | undefined, digits = 1) =>
  n == null || n === "" ? "—" : `${Number(n).toFixed(digits)}%`;
export const fmtNpr = (n: number | string | null | undefined) =>
  n == null ? "—" : `NPR ${Math.round(Number(n)).toLocaleString("en-IN")}`;

export function fmtDate(value: string | null | undefined, withTime = false) {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    ...(withTime ? { hour: "2-digit", minute: "2-digit" } : {}),
  });
}

export function relativeDays(value: string | null | undefined) {
  if (!value) return "Never";
  const days = Math.floor((Date.now() - new Date(value.replace(" ", "T")).getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 60) return `${days} days ago`;
  return fmtDate(value);
}

/** YYYY-MM-DD in the browser's local day. */
export function isoDate(d: Date) {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
