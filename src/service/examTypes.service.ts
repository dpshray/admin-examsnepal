import { PageParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class ExamTagService extends HttpService {

    async getAllExamType(params?: PageParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/examtype",
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


    createExamType(data: any) {
        try {
            return this.postRequest({
                url: "/admin/examtype",
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


    async getExamTypeById(id: number) {
        try {
            const response = await this.getRequest({
                url: `/admin/examtype/${id}`,
                config: {
                    auth: true,
                }
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching examTypes: ${error}`);
            throw error;
        }
    }

    async deleteExamType(id: number) {
        try {
            return await this.deleteRequest({
                url: `/admin/examtype/${id}`,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error deleting examType: ${error}`);
            throw error;
        }
    }

    async updateExamType(id: number, data: any) {
        try {
            return await this.putRequest({
                url: `/admin/examtype/${id}`,
                data,
                config: {auth: true},
            });
        } catch (error) {
            console.error(`Error updating examType: ${error}`);
            throw error;
        }
    }
}

export const examTypeService = new ExamTagService()