"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogService } from "@/service/blog.service";
import { toast } from "sonner";
import { GetParams } from "@/config/app-constant";

/*  GET ALL BLOGS  */
export function useGetAllClientBlogs(params: GetParams = {}) {
  return useQuery({
    queryKey: ["client-blogs", params],
    queryFn: () => blogService.getAllClientBlogs(params),
  });
}

export function useGetAllAdminBlogs(params: GetParams = {}) {
  return useQuery({
    queryKey: ["admin-blogs", params],
    queryFn: () => blogService.getAllAdminBlogs(params),
  });
}

/*  CREATE BLOG  */
export function useCreateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => blogService.createBlog(data),
    onSuccess: () => {
      toast.success("Blog created successfully");
      queryClient.invalidateQueries({ queryKey: ["client-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create blog");
    },
  });
}

/*  UPDATE BLOG  */
export function useUpdateBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      blogService.updateBlog(slug, data),
    onSuccess: () => {
      toast.success("Blog updated successfully");
      queryClient.invalidateQueries({ queryKey: ["client-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update blog");
    },
  });
}

/*  DELETE BLOG  */
export function useDeleteBlog() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogService.deleteBlog(slug),
    onSuccess: () => {
      toast.success("Blog deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["client-blogs"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blogs"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete blog");
    },
  });
}

/*  GET blog BY slug  */
export function useGetAdminBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ["admin-blog-detail", slug],
    queryFn: () => blogService.getAdminBlogBySlug(slug!),
    enabled: !!slug,
  });
}

export function useGetClientBlogBySlug(slug: string) {
  return useQuery({
    queryKey: ["client-blog-detail", slug],
    queryFn: () => blogService.getClientBlogBySlug(slug!),
    enabled: !!slug,
  });
}
