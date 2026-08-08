import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class PayoutService extends HttpService {
    async getAllPayouts(params?: PageParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/payouts",
                config: {
                    params,
                    auth: true,
                },
            });
            return response;
        } catch (error) {
            console.error("Error fetching payouts:", error);
            throw error;
        }
    }

    async getSummary(params?: { period_start?: string }) {
        try {
            const response = await this.getRequest({
                url: "/admin/payouts/summary",
                config: {
                    params,
                    auth: true,
                },
            });
            return response;
        } catch (error) {
            console.error("Error fetching payouts summary:", error);
            throw error;
        }
    }

    async getPayoutById(id: number) {
        try {
            const response = await this.getRequest({
                url: `/admin/payouts/${id}`,
                config: { auth: true },
            });
            return response;
        } catch (error) {
            console.error("Error fetching payout detail:", error);
            throw error;
        }
    }

    async approvePayout(id: number, remark?: string) {
        try {
            return await this.postRequest({
                url: `/admin/payouts/${id}/approve`,
                data: { remark },
                config: { auth: true },
            });
        } catch (error) {
            console.error("Error approving payout:", error);
            throw error;
        }
    }

    async markPayoutPaid(id: number, remark?: string) {
        try {
            return await this.postRequest({
                url: `/admin/payouts/${id}/mark-paid`,
                data: { remark },
                config: { auth: true },
            });
        } catch (error) {
            console.error("Error marking payout paid:", error);
            throw error;
        }
    }

    async revertPayout(id: number) {
        try {
            return await this.postRequest({
                url: `/admin/payouts/${id}/revert`,
                config: { auth: true },
            });
        } catch (error) {
            console.error("Error reverting payout:", error);
            throw error;
        }
    }
}

export const payoutService = new PayoutService();
