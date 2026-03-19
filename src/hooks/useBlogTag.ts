"use client";

import { GetParams } from "@/config/app-constant";
import { blogTagservice } from "@/service/blogTag.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

/*  GET ALL TAGS  */
export function useGetAllBlogTags(params: GetParams = {}) {
  return useQuery({
    queryKey: ["blog-tags", params],
    queryFn: () => blogTagservice.getAllBlogTags(params),
  });
}

/*  CREATE TAG  */
export function useCreateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: any) => blogTagservice.createBlogTag(data),
    onSuccess: () => {
      toast.success("Tag created successfully");
        queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to create tag");
    },
  });
}

/*  UPDATE TAG  */
export function useUpdateBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: any }) =>
      blogTagservice.updateBlogTag(slug, data),
    onSuccess: () => {
      toast.success("Tag updated successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update tag");
    },
  });
}

/*  DELETE TAG  */
export function useDeleteBlogTag() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (slug: string) => blogTagservice.deleteBlogTag(slug),
    onSuccess: () => {
      toast.success("Tag deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["blog-tags"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete tag");
    },
  });
}

/*  GET tag BY slug  */
export function useGetBlogTagBySlug(slug: string) {
  return useQuery({
    queryKey: ["blog-tags-detail", slug],
    queryFn: () => blogTagservice.getBlogTagBySlug(slug!),
    enabled: !!slug,
  });
}
