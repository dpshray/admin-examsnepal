import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class BlogService extends HttpService {

    async getAllClientBlogs(params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: "/client/blogs",
                config: { params },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching blogs: ${error}`);
            throw error;
        }
    }

    async getAllAdminBlogs(params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/blogs",
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching blogs: ${error}`);
            throw error;
        }
    }

    async createBlog(data: FormData) {
        try {
            return this.postRequest({
                url: "/admin/blogs",
                config: { auth: true, file: true },
                data,
            })
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }


    async getAdminBlogBySlug(slug: string, params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: `/admin/blogs/${slug}`,
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching blog: ${error}`);
            throw error;
        }
    }

    async getClientBlogBySlug(slug: string, params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: `/client/blogs/${slug}`,
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching blog: ${error}`);
            throw error;
        }
    }

    async deleteBlog(slug: string) {
        try {
        return await this.deleteRequest({
            url: `/admin/blogs/${slug}`,
            config: { auth: true },
        });
        } catch (error) {
        console.error(`Error deleting blog: ${error}`);
        throw error;
        }
    }

    async updateBlog(slug: string, data: FormData) {
        try {
        return await this.postRequest({
            url: `/admin/blogs/${slug}`,
            config: { auth: true, file: true },
            data,
        });
        } catch (error) {
        console.error(`Error updating blog: ${error}`);
        throw error;
        }
    }

}

export const blogService = new BlogService()