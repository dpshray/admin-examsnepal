export type NoticeCategory = "loksewa" | "entrance" | "license";
export type NoticeStatus = "pending" | "published" | "rejected" | "archived";
export type FetchType = "html_list" | "rss" | "json_api" | "pdf_list" | "manual";

export interface NoticePost {
  name: string;
  service_group: string | null;
  level: string | null;
  seats: number | null;
  qualification: string | null;
}

export interface NoticeAttachment {
  url: string;
  name?: string | null;
}

export interface Notice {
  id: number;
  source_id: number | null;
  source?: { id: number; name: string; list_url?: string; is_trusted?: boolean } | null;
  category: NoticeCategory;
  sub_category: string | null;
  organization: string;
  province: string | null;
  title_original: string;
  title_en: string | null;
  title_ne: string | null;
  slug: string;
  summary_en: string | null;
  summary_ne: string | null;
  source_url: string;
  attachment_urls: NoticeAttachment[] | null;
  published_date_bs: string | null;
  published_date_ad: string | null;
  application_start_ad: string | null;
  application_deadline_ad: string | null;
  double_fee_deadline_ad: string | null;
  exam_date_ad: string | null;
  exam_date_bs: string | null;
  notice_type: string;
  posts: NoticePost[] | null;
  fees: { label: string; amount: string }[] | null;
  eligibility: string[] | null;
  exam_centers: string[] | null;
  exam_tags: string[] | null;
  ai_confidence: number | null;
  ai_model: string | null;
  ai_raw?: Record<string, unknown> | null;
  ai_input_tokens: number | null;
  ai_output_tokens: number | null;
  enriched_at: string | null;
  enrichment_error: string | null;
  status: NoticeStatus;
  is_featured: boolean;
  view_count: number;
  published_at: string | null;
  created_at: string;
  open_reports_count?: number;
  reports?: NoticeReport[];
}

export interface NoticeReport {
  id: number;
  notice_id: number;
  notice?: Pick<Notice, "id" | "slug" | "title_en" | "title_original" | "status">;
  field: string | null;
  message: string;
  email: string | null;
  is_resolved: boolean;
  created_at: string;
}

export interface NoticeSource {
  id: number;
  name: string;
  organization: string;
  category: NoticeCategory;
  sub_category: string;
  province: string | null;
  base_url: string;
  list_url: string;
  fetch_type: FetchType;
  adapter_class: string | null;
  selectors: Record<string, unknown> | null;
  language: "ne" | "en" | "mixed";
  fetch_interval_minutes: number;
  is_active: boolean;
  is_trusted: boolean;
  verify_ssl: boolean;
  priority: number;
  notes: string | null;
  last_fetched_at: string | null;
  last_success_at: string | null;
  last_item_count: number | null;
  consecutive_failures: number;
  consecutive_empty_runs: number;
  last_error: string | null;
  is_healthy?: boolean;
  notices_count?: number;
  pending_count?: number;
}

export interface NoticeFetchLog {
  id: number;
  source_id: number;
  source?: { id: number; name: string };
  started_at: string;
  finished_at: string | null;
  items_found: number;
  items_new: number;
  status: "running" | "success" | "empty" | "failed" | "skipped";
  error: string | null;
}

export interface ParsedItem {
  title: string;
  title_alt: string | null;
  url: string;
  date_text: string | null;
  published_date_bs: string | null;
  published_date_ad: string | null;
  attachments: NoticeAttachment[];
  would_insert: boolean;
}

export interface NoticeMeta {
  categories: NoticeCategory[];
  types: string[];
  statuses: NoticeStatus[];
  provinces: string[];
  sub_categories: Record<NoticeCategory, string[]>;
  exam_tags: Record<string, string>;
  fetch_types: FetchType[];
}

export interface Paginated<T> {
  data: T[];
  current_page: number;
  last_page: number;
  total: number;
}
