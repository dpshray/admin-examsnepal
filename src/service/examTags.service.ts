import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class ExamTagService extends HttpService {

    async getAllExamTag(params?: PageParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/exam-tags",
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


    createExamTag(data: any) {
        try {
            return this.postRequest({
                url: "/admin/exam-tags",
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


    async getExamTagBySlug(slug: string) {
        try {
            const response = await this.getRequest({
                url: `/admin/exam-tags/${slug}`,
                config: {
                    auth: true,
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching exam tags: ${error}`);
            throw error;
        }
    }

    async deleteExamTag(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/exam-tags/${slug}`,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error deleting exam tag: ${error}`);
            throw error;
        }
    }

    async updateExamTag(slug: string, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/exam-tags/${slug}`,
                data,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error updating exam tag: ${error}`);
            throw error;
        }
    }
}

export const examTagService = new ExamTagService()