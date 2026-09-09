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

  //promo-code
  async getPromoCodes(params?: PageParams) {
    try {
      const response = await this.getRequest({
        url: "/admin/promo-code",
        config: {
          params,
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error fetching promo codes:", error);
      throw error;
    }
  }

  async addPromoCode(data: any) {
    try {
      const response = await this.postRequest({
        url: "/admin/promo-code",
        data,
        config: {
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error adding promo code:", error);
      throw error;
    }
  }

  async updatePromoCode(id: string, data: any) {
    try {
      const response = await this.putRequest({
        url: `/admin/promo-code/${id}`,
        data,
        config: {
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error updating promo code:", error);
      throw error;
    }
  }

  async deletePromoCode(id: string) {
    try {
      const response = await this.deleteRequest({
        url: `/admin/promo-code/${id}`,
        config: {
          auth: true,
        },
      });
      return response;
    } catch (error) {
      console.error("Error deleting promo code:", error);
      throw error;
    }
  }
}

export const paymentService = new PaymentService();
