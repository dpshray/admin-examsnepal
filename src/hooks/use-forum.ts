import { GetParams } from "@/config/app-constant";
import forumService from "@/service/forum.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useGetAllForumReports = (params?: GetParams) => {
  return useQuery({
    queryKey: ["forum-reports", params],
    queryFn: () => forumService.getAllForumReports(params),
  });
};

export const useDeleteForumReportContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => forumService.deleteForumReportContent(id),
    onSuccess: () => {
      toast.success("Forum report content deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["forum-reports"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete forum report content");
    },
  });
};

export const useGetAllBlockedUsers = (params?: GetParams) => {
  return useQuery({
    queryKey: ["blocked-users", params],
    queryFn: () => forumService.getAllBlockedUsers(params),
  });
};
