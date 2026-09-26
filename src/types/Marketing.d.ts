export type LifecycleStage =
  | "expiring_soon"
  | "paid_active"
  | "paid_inactive"
  | "expired"
  | "hot_lead"
  | "new"
  | "registered_inactive"
  | "dormant"
  | "engaged_free"
  | "free_only"
  | "activated";

export type SubscriptionStatus = "never" | "active" | "expiring_soon" | "expired";
export type ScoreTrend = "improving" | "flat" | "declining" | "insufficient_data";
export type AttemptType = "free" | "sprint" | "mock" | "topic" | "other";

export interface Kpi<T = number | null> {
  value: T;
  previous: T;
  change_pct: number | null;
}

export interface PlanRevenue {
  months: number;
  count: number;
  revenue_npr: number;
}

export interface MarketingKpis {
  new_registrations: Kpi<number>;
  activation_rate: Kpi;
  active_students_7d: Kpi<number>;
  active_students_30d: Kpi<number>;
  attempts_free: Kpi<number>;
  attempts_sprint: Kpi<number>;
  attempts_mock: Kpi<number>;
  attempts_topic: Kpi<number>;
  free_to_paid_rate: Kpi;
  new_paid_subscriptions: Kpi<number>;
  revenue_npr: Kpi<number>;
  revenue_by_plan: Kpi<PlanRevenue[]>;
  manual_subscriptions: Kpi<number>;
  manual_revenue_npr: Kpi<number>;
  renewal_rate: Kpi;
  emails_sent: Kpi;
  email_click_rate: Kpi;
  email_attributed_conversions: Kpi;
}

export interface FunnelStep {
  key: string;
  label: string;
  count: number;
  conversion_from_previous: number | null;
  drop_off_pct: number | null;
}

export interface DailyPoint {
  date: string;
  registrations: number;
  first_exams: number;
  payments: number;
  free: number;
  sprint: number;
  mock: number;
  topic: number;
}

export interface TopExam {
  exam_id: number;
  exam_name: string;
  type: AttemptType;
  attempts: number;
  students: number;
  converted: number;
  conversion_rate: number | null;
}

export interface MarketingOverview {
  period: { from: string; to: string };
  previous_period: { from: string; to: string };
  kpis: MarketingKpis;
  funnel: FunnelStep[];
  daily: { granularity: "day" | "week"; series: DailyPoint[] };
  stage_distribution: { stage: LifecycleStage; count: number }[];
  top_exams: { by_attempts: TopExam[]; by_conversion: TopExam[] };
  unknown_signup_students: number;
  metrics_updated_at: string | null;
}

export interface CohortRow {
  week_start: string;
  size: number;
  cells: (number | null)[];
}

export interface SavedSegment {
  id: number;
  name: string;
  filters: StudentFilters;
  count?: number;
}

export interface MarketingMeta {
  stages: LifecycleStage[];
  segments: string[];
  exam_types: { id: number; name: string; is_active: number }[];
  subscription_statuses: SubscriptionStatus[];
  signup_sources: string[];
  tags: string[];
  saved_segments: SavedSegment[];
  metrics_updated_at: string | null;
}

export interface StudentFilters {
  search?: string;
  stage?: string;
  segment?: string;
  exam_type_id?: string;
  exam_type_taken?: string;
  attempts_min?: string;
  attempts_max?: string;
  score_min?: string;
  score_max?: string;
  inactive_days_min?: string;
  inactive_days_max?: string;
  subscription_status?: string;
  signed_up_from?: string;
  signed_up_to?: string;
  signup_source?: string;
  platform?: "app" | "web" | "";
  tag?: string;
  lead_min?: string;
  segment_id?: string;
}

export interface MarketingStudentRow {
  student_id: number;
  name: string;
  email: string;
  phone: string | null;
  exam_type_id: number | null;
  target_exam: string | null;
  signed_up_at: string | null;
  lifecycle_stage: LifecycleStage | null;
  total_attempts: number;
  free_attempts: number;
  sprint_attempts: number;
  mock_attempts: number;
  topic_attempts: number;
  avg_score_pct: string | null;
  score_trend: ScoreTrend;
  last_seen_at: string | null;
  subscription_status: SubscriptionStatus;
  subscription_ends_at: string | null;
  lead_score: number;
  segments: string[];
  tags: string[];
}

export interface StudentAttempt {
  id: number;
  exam_id: number;
  exam_name: string;
  type: AttemptType;
  completed: boolean;
  score_pct: number | null;
  submitted_at: string | null;
  started_at: string | null;
}

export interface StudentProfileDetail {
  profile: {
    id: number;
    name: string;
    email: string;
    phone: string | null;
    target_exam: string | null;
    created_at: string | null;
    target_exam_date: string | null;
    signup_source: string | null;
    utm_source: string | null;
    utm_medium: string | null;
    utm_campaign: string | null;
    requested_from: string | null;
    last_platform: string | null;
    marketing_email_opt_in: number | boolean;
    unsubscribed_at: string | null;
  };
  metrics: (Omit<MarketingStudentRow, "name" | "email" | "phone" | "target_exam" | "tags"> & {
    lead_score_breakdown: Record<string, number>;
    best_score_pct: string | null;
    last_score_pct: string | null;
    current_streak_days: number;
    longest_streak_days: number;
    percentile_in_exam: string | null;
    total_paid_npr: string;
    payments_count: number;
    pricing_page_views: number;
    checkout_started_at: string | null;
    weakest_subject_id: number | null;
    strongest_subject_id: number | null;
    attempts_last_7d: number;
    attempts_last_30d: number;
    updated_at: string;
  }) | null;
  tags: string[];
  attempts: StudentAttempt[];
  score_series: { date: string; score_pct: number; type: AttemptType; exam_name: string }[];
  subjects: { id: number; name: string; attempts: number; avg_score_pct: string }[];
  payments: {
    id: number;
    transaction_id: string;
    payment_status: string | null;
    status: number;
    price: string;
    paid: string;
    months: number | null;
    start_date: string;
    end_date: string;
    subscribed_at: string;
    remark: string | null;
    is_manual: boolean;
  }[];
  events: { id: number; name: string; properties: Record<string, unknown> | null; platform: string | null; created_at: string }[];
  messages: StudentMessage[];
}

export interface StudentMessage {
  id: number;
  channel: string;
  automation: string | null;
  template_key: string;
  variant: "A" | "B";
  subject: string | null;
  status: MessageStatus;
  suppress_reason: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  goal_met_at: string | null;
}

export type MessageStatus = "queued" | "sent" | "delivered" | "bounced" | "opened" | "clicked" | "failed" | "suppressed";

export interface AutomationStats {
  automation_id: number;
  variant: "A" | "B";
  sent: number;
  opened: number;
  clicked: number;
  bounced: number;
  unsubscribed: number;
  suppressed: number;
  failed: number;
  goal_met: number;
  open_rate: number | null;
  click_rate: number | null;
  goal_rate: number | null;
}

export interface AutomationRow {
  id: number;
  key: string;
  name: string;
  channel: "email" | "push" | "sms" | "auto";
  allow_sms: boolean;
  schedule: { weekdays?: number[]; hours?: number[] } | null;
  trigger_type: "event" | "scheduled";
  trigger_event: string | null;
  conditions: Record<string, string | number> | null;
  template_key: string;
  template_name: string | null;
  variant_b_template_key: string | null;
  ab_split_pct: number;
  delay_minutes: number;
  goal_event: string | null;
  cooldown_days: number;
  priority: number;
  is_upsell: boolean;
  is_active: boolean;
  queued: number;
  stats: AutomationStats[];
  ab: AbResult | null;
}

export interface AbResult {
  variants: Record<"A" | "B", { template_key: string; sent: number; goal_met: number; goal_rate: number | null }>;
  winner: "A" | "B" | null;
  confidence: string | null;
  needs_more_data: boolean;
}

export type TemplateCategory = "transactional" | "lifecycle" | "promotional";

export interface EmailTemplateRow {
  id: number;
  key: string;
  name: string;
  category: TemplateCategory;
  subject: string;
  preheader: string | null;
  html_body: string;
  text_body: string | null;
  cta_label: string | null;
  cta_path: string | null;
  is_active: boolean;
  used_by: string[];
  updated_at: string;
}

export interface RenderedEmail {
  subject: string;
  preheader: string;
  html: string;
  text: string;
  student_id: number;
}

export interface BroadcastRow {
  id: number;
  name: string;
  template_key: string;
  filters: StudentFilters;
  status: "scheduled" | "queued" | "cancelled";
  scheduled_for: string;
  recipients_queued: number | null;
  recipients_skipped: number | null;
  created_at: string;
  stats: { sent: number; queued: number; suppressed: number; opened: number; clicked: number } | null;
}

export interface BroadcastPreview {
  candidates: number;
  would_send: number;
  skipped: Record<string, number>;
  estimated_days: number | null;
}

export interface MessagingStatus {
  paused: boolean;
  paused_changed: { admin_id: number | null; at: string; paused: boolean } | null;
  send_window_open: boolean;
  next_window_at: string;
  queued: number;
  sent_today: number;
  sent_last_hour: number;
  max_per_hour: number;
  suppressed_addresses: number;
  from: string;
}

export interface DryRun {
  automation: string;
  candidates: number;
  would_send: number;
  skipped: Record<string, number>;
  sample: { student_id: number; name: string; email: string }[];
  note: string;
}

export interface MessageLogRow {
  id: number;
  student_id: number;
  name: string;
  email: string;
  automation_key: string | null;
  template_key: string;
  variant: string;
  status: MessageStatus;
  suppress_reason: string | null;
  subject: string | null;
  scheduled_for: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  goal_met_at: string | null;
  error: string | null;
}

export interface SuppressionRow {
  id: number;
  email: string;
  reason: string;
  detail: string | null;
  created_at: string;
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
