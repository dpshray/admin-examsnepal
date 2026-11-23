import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

export interface SendNotificationPayload {
  title: string;
  body: string;
  exam_type_id: number;
  send_and_store: boolean;
}

class NotificationService extends HttpService {
  async getNotifications(params?: GetParams) {
    try {
      const response = await this.getRequest({
        url: "/admin/students-notifications",
        config: { params, auth: true },
      });
      return response?.data;
    } catch (error) {
      console.error(`Error fetching notifications: ${error}`);
      throw error;
    }
  }

  async sendNotification(data: SendNotificationPayload) {
    try {
      return await this.postRequest({
        url: "/students/notifications",
        config: { auth: true },
        data,
      });
    } catch (error) {
      console.error(`Error sending notification: ${error}`);
      throw error;
    }
  }

  async deletenotification(id: number) {
    try {
      return await this.deleteRequest({
        url: `/admin/students-notifications/${id}`,
        config: { auth: true },
      });
    } catch (error) {
      console.error(`Error deleting notification: ${error}`);
      throw error;
    }
  }
}

export const notificationService = new NotificationService();
