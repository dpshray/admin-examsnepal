import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";
import type { StudentFilters } from "@/types/Marketing";

/** Drop empty values so they don't reach the API as `key=`. */
export const cleanParams = (params: object = {}) =>
  Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ""));

class MarketingService extends HttpService {
  getOverview(params: { from: string; to: string; exam_type_id?: string }) {
    return this.getRequest({ url: "/admin/marketing/overview", config: { params: cleanParams(params), auth: true } });
  }

  getCohorts(params: { weeks: number; exam_type_id?: string }) {
    return this.getRequest({ url: "/admin/marketing/cohorts", config: { params: cleanParams(params), auth: true } });
  }

  getMeta() {
    return this.getRequest({ url: "/admin/marketing/meta", config: { auth: true } });
  }

  getStudents(params: GetParams) {
    return this.getRequest({ url: "/admin/marketing/students", config: { params: cleanParams(params), auth: true } });
  }

  getStudent(id: number) {
    return this.getRequest({ url: `/admin/marketing/students/${id}`, config: { auth: true } });
  }

  getSegments() {
    return this.getRequest({ url: "/admin/marketing/segments", config: { auth: true } });
  }

  saveSegment(name: string, filters: StudentFilters) {
    return this.postRequest({ url: "/admin/marketing/segments", data: { name, filters: cleanParams(filters) }, config: { auth: true } });
  }

  deleteSegment(id: number) {
    return this.deleteRequest({ url: `/admin/marketing/segments/${id}`, config: { auth: true } });
  }

  tagStudents(data: { tag: string; action: "add" | "remove"; student_ids?: number[]; filters?: StudentFilters }) {
    return this.postRequest({
      url: "/admin/marketing/students/tags",
      data: { ...data, filters: data.filters ? cleanParams(data.filters) : undefined },
      config: { auth: true },
    });
  }

  // ---- email automation
  getMessagingStatus() {
    return this.getRequest({ url: "/admin/marketing/messaging/status", config: { auth: true } });
  }

  setPaused(paused: boolean) {
    return this.postRequest({ url: "/admin/marketing/messaging/pause", data: { paused }, config: { auth: true } });
  }

  getAutomations(days = 30) {
    return this.getRequest({ url: "/admin/marketing/automations", config: { params: { days }, auth: true } });
  }

  updateAutomation(id: number, data: Record<string, unknown>) {
    return this.patchRequest({ url: `/admin/marketing/automations/${id}`, data, config: { auth: true } });
  }

  previewAutomation(id: number) {
    return this.getRequest({ url: `/admin/marketing/automations/${id}/preview`, config: { auth: true } });
  }

  getSends(params: GetParams) {
    return this.getRequest({ url: "/admin/marketing/sends", config: { params: cleanParams(params), auth: true } });
  }

  getSuppressions(params: GetParams) {
    return this.getRequest({ url: "/admin/marketing/suppressions", config: { params: cleanParams(params), auth: true } });
  }

  addSuppression(email: string) {
    return this.postRequest({ url: "/admin/marketing/suppressions", data: { email }, config: { auth: true } });
  }

  removeSuppression(id: number) {
    return this.deleteRequest({ url: `/admin/marketing/suppressions/${id}`, config: { auth: true } });
  }

  // ---- templates, A/B, broadcasts
  getTemplates() {
    return this.getRequest({ url: "/admin/marketing/templates", config: { auth: true } });
  }

  saveTemplate(key: string | null, data: Record<string, unknown>) {
    return key
      ? this.putRequest({ url: `/admin/marketing/templates/${key}`, data, config: { auth: true } })
      : this.postRequest({ url: "/admin/marketing/templates", data, config: { auth: true } });
  }

  deleteTemplate(key: string) {
    return this.deleteRequest({ url: `/admin/marketing/templates/${key}`, config: { auth: true } });
  }

  previewDraft(data: Record<string, unknown>) {
    return this.postRequest({ url: "/admin/marketing/templates/draft-preview", data, config: { auth: true } });
  }

  sendTestTemplate(key: string, studentId?: number) {
    return this.postRequest({ url: `/admin/marketing/templates/${key}/test`, data: { student_id: studentId }, config: { auth: true } });
  }

  promoteVariant(id: number, variant: "A" | "B") {
    return this.postRequest({ url: `/admin/marketing/automations/${id}/promote`, data: { variant }, config: { auth: true } });
  }

  getBroadcasts() {
    return this.getRequest({ url: "/admin/marketing/broadcasts", config: { auth: true } });
  }

  previewBroadcast(template_key: string, filters: StudentFilters) {
    return this.postRequest({ url: "/admin/marketing/broadcasts/preview", data: { template_key, filters: cleanParams(filters) }, config: { auth: true } });
  }

  createBroadcast(data: { name: string; template_key: string; filters: StudentFilters; scheduled_for?: string }) {
    return this.postRequest({ url: "/admin/marketing/broadcasts", data: { ...data, filters: cleanParams(data.filters) }, config: { auth: true } });
  }

  cancelBroadcast(id: number) {
    return this.postRequest({ url: `/admin/marketing/broadcasts/${id}/cancel`, config: { auth: true } });
  }

  /** CSV download goes through fetch so the bearer token is sent (axios would buffer JSON). */
  async exportStudents(filters: StudentFilters) {
    const base = (process.env.NEXT_PUBLIC_BASE_API_URL ?? "").replace(/\/$/, "");
    const qs = new URLSearchParams(cleanParams(filters) as Record<string, string>).toString();
    const res = await fetch(`${base}/admin/marketing/students/export${qs ? `?${qs}` : ""}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("_at") ?? ""}` },
    });
    if (!res.ok) throw new Error(`Export failed (${res.status})`);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `students-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

export const marketingService = new MarketingService();
