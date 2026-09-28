import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class NoticeService extends HttpService {
  // ---- notices
  getNotices(params?: GetParams) {
    return this.getRequest({ url: "/admin/notices", config: { params, auth: true } });
  }

  getNotice(id: number | string) {
    return this.getRequest({ url: `/admin/notices/${id}`, config: { auth: true } });
  }

  getStats() {
    return this.getRequest({ url: "/admin/notices/stats", config: { auth: true } });
  }

  getMeta() {
    return this.getRequest({ url: "/admin/notices/meta", config: { auth: true } });
  }

  createNotice(data: Record<string, unknown>) {
    return this.postRequest({ url: "/admin/notices", data, config: { auth: true } });
  }

  updateNotice(id: number, data: Record<string, unknown>) {
    return this.putRequest({ url: `/admin/notices/${id}`, data, config: { auth: true } });
  }

  deleteNotice(id: number) {
    return this.deleteRequest({ url: `/admin/notices/${id}`, config: { auth: true } });
  }

  noticeAction(id: number, action: "approve" | "reject" | "feature" | "re-enrich") {
    return this.postRequest({ url: `/admin/notices/${id}/${action}`, config: { auth: true } });
  }

  // ---- reports
  getReports(params?: GetParams) {
    return this.getRequest({ url: "/admin/notice-reports", config: { params, auth: true } });
  }

  resolveReport(id: number) {
    return this.postRequest({ url: `/admin/notice-reports/${id}/resolve`, config: { auth: true } });
  }

  // ---- sources
  getSources(params?: GetParams) {
    return this.getRequest({ url: "/admin/notice-sources", config: { params, auth: true } });
  }

  getSource(id: number) {
    return this.getRequest({ url: `/admin/notice-sources/${id}`, config: { auth: true } });
  }

  createSource(data: Record<string, unknown>) {
    return this.postRequest({ url: "/admin/notice-sources", data, config: { auth: true } });
  }

  updateSource(id: number, data: Record<string, unknown>) {
    return this.putRequest({ url: `/admin/notice-sources/${id}`, data, config: { auth: true } });
  }

  deleteSource(id: number) {
    return this.deleteRequest({ url: `/admin/notice-sources/${id}`, config: { auth: true } });
  }

  /** Runs the adapter without saving; pass unsaved form values to test edits. */
  testFetch(id: number | null, data?: Record<string, unknown>) {
    const url = id ? `/admin/notice-sources/${id}/test-fetch` : "/admin/notice-sources/test-fetch";
    return this.postRequest({ url, data, config: { auth: true } });
  }

  fetchNow(id: number) {
    return this.postRequest({ url: `/admin/notice-sources/${id}/fetch-now`, config: { auth: true } });
  }

  getFetchLogs(params?: GetParams) {
    return this.getRequest({ url: "/admin/notice-fetch-logs", config: { params, auth: true } });
  }
}

export const noticeService = new NoticeService();
