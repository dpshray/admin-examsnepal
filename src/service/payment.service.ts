import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class PaymentService extends HttpService {
  async getPaymentSettings(params?: PageParams) {
    try {
      const response = await this.getRequest({
        url: "/admin/payment-settings",
        config: {
          params,
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching payment settings:", error);
      throw error;
    }
  }

  async updatePaymentSettings(name: string, status: boolean) {
    try {
      const response = await this.postRequest({
        url: `/admin/payment-settings`,
        data: {
          name,
          status,
        },
        config: {
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating payment settings:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
