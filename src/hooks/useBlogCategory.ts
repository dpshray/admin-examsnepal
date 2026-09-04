"use client";

import { GetParams } from "@/config/app-constant";
import { blogCategorieservice } from "@/service/blogCategory.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/*  GET ALL CATEGORIES  */
export function useGetAllBlogCategories(params: GetParams = {}) {
  return useQuery({
    queryKey: ["blog-category", params],
    queryFn: () => blogCategorieservice.getAllBlogCategories(params),
  });
}

/*  CREATE CATEGORY  */
export function useCreateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => blogCategorieservice.createBlogCategory(data),
    onSuccess: () => {
      toast.success("Category created successfully");
        queryClient.invalidateQueries({ queryKey: ["blog-category"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create category");
    },
  });
}

/*  UPDATE CATEGORY  */
export function useUpdateBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      blogCategorieservice.updateBlogCategory(slug, data),
    onSuccess: () => {
      toast.success("Category updated successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-category"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update category");
    },
  });
}

/*  DELETE CATEGORY  */
export function useDeleteBlogCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogCategorieservice.deleteBlogCategory(slug),
    onSuccess: () => {
      toast.success("Category deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-category"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete category");
    },
  });
}

/*  GET category BY slug  */
export function useGetBlogCategoryBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-category-detail", slug],
    queryFn: () => blogCategorieservice.getBlogCategoryBySlug(slug!),
    enabled: !!slug,
  });
}
