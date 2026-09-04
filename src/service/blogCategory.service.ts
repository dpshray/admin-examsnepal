import { GetParams } from "@/config/app-constant";
import HttpService from "@/service/http.service";

class BlogCategorieservice extends HttpService {

    async getAllBlogCategories(params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: "/admin/blog/category",
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching categories: ${error}`);
            throw error;
        }
    }

    async createBlogCategory(data: any) {
        try {
            return this.postRequest({
                url: "/admin/blog/category",
                config: { auth: true },
                data,
            })
        } catch (error) {
            console.error(`Error logging in: ${error}`)
            throw error
        }
    }


    async getBlogCategoryBySlug(slug: string, params?: GetParams) {
        try {
            const response = await this.getRequest({
                url: `/admin/blog/category/${slug}`,
                config: { params, auth: true },
            });
            return response?.data;
        } catch (error) {
            console.error(`Error fetching category: ${error}`);
            throw error;
        }
    }

    async deleteBlogCategory(slug: string) {
        try {
            return await this.deleteRequest({
                url: `/admin/blog/category/${slug}`,
                config: { auth: true },
            });
        } catch (error) {
            console.error(`Error deleting category: ${error}`);
            throw error;
        }
    }

    async updateBlogCategory(slug: string, data: any) {
        try {
            return await this.postRequest({
                url: `/admin/blog/category/${slug}`,
                config: { auth: true },
                data,
            });
        } catch (error) {
            console.error(`Error updating category: ${error}`);
            throw error;
        }
    }

}

export const blogCategorieservice = new BlogCategorieservice()