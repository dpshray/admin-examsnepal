import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class SubscriptionService extends HttpService {

    async getAllSubscription(params?: PageParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/subscription-type-list",
                config: {
                    params,
                    auth: true,
                }
            })
            return response?.data
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }


    createSubscription(data: any) {
        try {
            return this.postRequest({
                url: "/admin/subscription-type",
                data,
                config: {
                    auth: true
                }
            })
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }


    async getSubscriptionById(id: number) {
        try {
            const response = await this.getRequest({
                url: `/admin/subscription-type/${id}`,
                config: {
                    auth: true,
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching subscriptions: ${error}`);
            throw error;
        }
    }

    async deleteSubscription(id: number) {
        try {
            return await this.deleteRequest({
                url: `/admin/subscription-type/${id}`,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error deleting subscription: ${error}`);
            throw error;
        }
    }

    async updateSubscription(id: number, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/subscription-type/${id}`,
                data,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error updating subscription: ${error}`);
            throw error;
        }
    }
}

export const subscriptionService = new SubscriptionService()