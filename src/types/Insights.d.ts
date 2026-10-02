import type { Kpi } from "@/types/Marketing";

export type InsightSourceKey = "search" | "analytics" | "facebook";
export type InsightKind = "win" | "warning" | "opportunity" | "info";

export interface InsightItem {
  source: InsightSourceKey | "cross";
  kind: InsightKind;
  title: string;
  detail: string;
  action: string | null;
  priority: number;
}

export interface SourceResult<T> {
  configured: boolean;
  data: T | null;
  error: string | null;
  fetched_at: string | null;
  setup: string[];
}

// ---- Search Console
export interface QueryRow {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
  topic: string | null;
  intent: string | null;
  brand: boolean;
  previous_clicks: number;
  previous_position: number | null;
  click_change: number;
  potential_clicks?: number;
  expected_ctr?: number;
}

export interface TopicRow {
  key: string;
  label: string;
  queries: number;
  clicks: number;
  previous_clicks: number;
  click_change_pct: number | null;
  impressions: number;
  ctr: number;
  position: number | null;
  search_share: number | null;
  students: number | null;
  student_share: number | null;
}

export interface SearchData {
  kpis: { clicks: Kpi<number>; impressions: Kpi<number>; ctr: Kpi; position: Kpi };
  series: { date: string; clicks: number; impressions: number; position: number }[];
  brand: { brand_clicks: number; non_brand_clicks: number; brand_share: number; visible_click_share: number };
  top_queries: QueryRow[];
  striking_distance: QueryRow[];
  low_ctr: QueryRow[];
  rising: QueryRow[];
  new_queries: QueryRow[];
  declining: { query: string; clicks: number; previous_clicks: number; click_change: number; position: number | null; previous_position: number | null }[];
  topics: TopicRow[];
  intents: { key: string; label: string; queries: number; clicks: number; impressions: number; ctr: number }[];
  pages: { page: string; clicks: number; impressions: number; ctr: number; position: number }[];
  devices: { device: string; clicks: number; impressions: number; ctr: number; position: number }[];
  countries: { country: string; clicks: number; impressions: number }[];
  insights: InsightItem[];
}

// ---- GA4
export interface ChannelRow {
  channel: string;
  sessions: number;
  previous_sessions: number;
  change_pct: number | null;
  share: number;
  new_users: number;
  engagement_rate: number;
  avg_session_seconds: number;
  key_events: number;
  key_event_rate: number;
}

export interface AnalyticsData {
  kpis: {
    active_users: Kpi<number>;
    new_users: Kpi<number>;
    sessions: Kpi<number>;
    engagement_rate: Kpi;
    avg_session_seconds: Kpi;
    page_views: Kpi<number>;
    key_events: Kpi<number>;
  };
  series: { date: string; active_users: number; new_users: number; sessions: number }[];
  channels: ChannelRow[];
  sources: { source: string; sessions: number; new_users: number; engagement_rate: number; key_events: number }[];
  landing_pages: { page: string; sessions: number; new_users: number; engagement_rate: number; key_events: number }[];
  cities: { city: string; active_users: number; sessions: number }[];
  countries: { country: string; active_users: number }[];
  devices: { device: string; active_users: number; sessions: number; engagement_rate: number }[];
  heatmap: number[][];
  events: { event: string; count: number; is_key_event: boolean }[];
  insights: InsightItem[];
}

// ---- Facebook
export interface FbPost {
  id: string;
  message: string;
  created_at: string;
  format: string;
  topic: string | null;
  permalink: string | null;
  image: string | null;
  reactions: number;
  comments: number;
  shares: number;
  engagement: number;
}

export interface FbGroupRow {
  key: string;
  label: string;
  posts: number;
  avg_engagement: number;
  avg_comments: number;
  avg_shares: number;
}

export interface FacebookData {
  page: { name: string | null; link: string | null; picture: string | null; followers: number; likes: number | null };
  kpis: {
    posts: Kpi<number>;
    engagement: Kpi<number>;
    avg_engagement: Kpi;
    comments: Kpi<number>;
    shares: Kpi<number>;
    engagement_per_1k: Kpi;
  };
  posts_per_week: number;
  longest_gap_days: number | null;
  by_format: FbGroupRow[];
  by_topic: FbGroupRow[];
  by_day: FbGroupRow[];
  by_hour: FbGroupRow[];
  series: { date: string; posts: number; engagement: number }[];
  top_posts: FbPost[];
  weakest_posts: FbPost[];
  page_insights: Record<string, { label: string; total: number; since: string | null; series: { date: string; value: number }[] }>;
  unavailable_metrics: { metric: string; error: string }[];
  insights: InsightItem[];
}

export interface InsightsSummary {
  sources: Record<InsightSourceKey, { configured: boolean; loaded: boolean }>;
  insights: InsightItem[];
  signup_sources: { source: string; students: number }[];
}

export interface MarketingBrief {
  available: boolean;
  reason?: string;
  model?: string;
  generated_at?: string;
  brief?: {
    headline: string;
    situation: string;
    priorities: { title: string; why: string; actions: string[]; channel: string; impact: "high" | "medium" | "low"; effort: "high" | "medium" | "low" }[];
    content_ideas: { title: string; format: string; channel: string; reason: string }[];
    weekly_plan: { day: string; task: string }[];
    watch_metrics: string[];
  };
}
