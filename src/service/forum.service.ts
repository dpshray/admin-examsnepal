import { GetParams } from "@/config/app-constant";
import HttpServices from "./http.service";

class ForumService extends HttpServices {
  async getAllForumReports(params?: GetParams) {
    try {
      const response = await this.getRequest({
        url: "/admin/forum-question-report",
        config: { auth: true, params },
      });
      return response?.data;
    } catch (error) {
      console.error(`Error fetching blogs: ${error}`);
      throw error;
    }
  }

  async deleteForumReportContent(id: number) {
    try {
      const response = await this.deleteRequest({
        url: `/admin/forum-question-report/${id}`,
        config: { auth: true },
      });
      return response?.data;
    } catch (error) {
      console.error(`Error deleting forum content: ${error}`);
      throw error;
    }
  }

  //blocked-user
  async getAllBlockedUsers(params?: GetParams) {
    try {
      const response = await this.getRequest({
        url: "/admin/blocked-users",
        config: { auth: true, params },
      });
      return response;
    } catch (error) {
      console.error(`Error blocking forum user: ${error}`);
      throw error;
    }
  }
}

const forumService = new ForumService();
export default forumService;
