import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class BlogTagservice extends HttpService {

    async getAllBlogTags(params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/blog/tag",
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching tags: ${error}`);
            throw error;
        }
    }

    async createBlogTag(data: any) {
        try {
            return this.postRequest({
                url: "/admin/blog/tag",
                config: { auth: true },
                data,
            })
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }


    async getBlogTagBySlug(slug: string, params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: `/admin/blog/tag/${slug}`,
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching tag: ${error}`);
            throw error;
        }
    }

    async deleteBlogTag(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/blog/tag/${slug}`,
                config: { auth: true },
            });
        } catch (error) {
            console.error(`Error deleting tag: ${error}`);
            throw error;
        }
    }

    async updateBlogTag(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/blog/tag/${slug}`,
                config: { auth: true },
                data,
            });
        } catch (error) {
            console.error(`Error updating tag: ${error}`);
            throw error;
        }
    }

}

export const blogTagservice = new BlogTagservice()