import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class InstituteService extends HttpService {
    async getAllInstitutes(params?: PageParams) {
        try {
            return await this.getRequest({
                url: "/admin/institutes",
                config: {
                    params,
                    auth: true,
                },
            });
        } catch (error) {
            console.error("Error fetching institutes:", error);
            throw error;
        }
    }

    async toggleStatus(id: number) {
        try {
            return await this.postRequest({
                url: `/admin/institutes/${id}/toggle-status`,
                config: { auth: true },
            });
        } catch (error) {
            console.error("Error toggling institute status:", error);
            throw error;
        }
    }
}

export const instituteService = new InstituteService();
