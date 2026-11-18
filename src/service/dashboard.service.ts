import HttpService from "@/service/http.service";

export interface DashboardSummary {
  totals: {
    students: number;
    active_subscribers: number;
    expiring_soon: number;
    active_exams: number;
    questions: number;
  };
  queues: {
    open_doubts: number;
    forum_reports: number;
    pending_notices: number;
    notice_reports: number;
    pending_payouts: number;
    pending_payouts_amount: number;
    failed_fetches_24h: number;
  };
}

class DashboardService extends HttpService {
  getSummary() {
    return this.getRequest({ url: "/admin/dashboard/summary", config: { auth: true } });
  }
}

export const dashboardService = new DashboardService();
