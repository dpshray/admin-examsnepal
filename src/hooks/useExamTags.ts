import { PageParams } from "@/config/app-constant";
import { examTagService } from "@/service/examTags.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
    import { toast } from "sonner";

export const useExamTags = (params?: PageParams) => {
    return useQuery({
        queryKey: ["exam-tags", params],
        queryFn: async () => {
            const res = await examTagService.getAllExamTag(params);
            return res;
        },
    });
};

export function useCreateExamTag() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => examTagService.createExamTag(data),
        onSuccess: () => {
            toast.success("Exam Tag created successfully!");
            queryClient.invalidateQueries({ queryKey: ["exam-tags"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create exam tag .");
        }
    })
}

export function useGetExamTagBySlug(
    examtagSlug: string,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ["examtag-detail", examtagSlug],
        queryFn: () => examTagService.getExamTagBySlug(examtagSlug),
        ...options,
    });
}

export const useUpdateExamTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({examtagSlug, data}: {examtagSlug: string; data: any}) => examTagService.updateExamTag(examtagSlug, data),
        onSuccess: () => {
            toast.success("Exam Tag updated successfully!")
            queryClient.invalidateQueries({ queryKey: ["exam-tags"] });
            queryClient.invalidateQueries({ queryKey: ["examtag-detail"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update exam tag.");
        }
    })
}

export const useDeleteExamTag = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (examtagSlug: string) => examTagService.deleteExamTag(examtagSlug),
        onSuccess: () => {
            toast.success("Exam Tag deleted successfully!")
            queryClient.invalidateQueries({ queryKey: ["exam-tags"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete exam tag.");
        }
    })
}

