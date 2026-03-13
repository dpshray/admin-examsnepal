import { PageParams } from "@/config/app-constant";
import { examTypeService } from "@/service/examTypes.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
    import { toast } from "sonner";

export const useExamTypes = (params?: PageParams) => {
    return useQuery({
        queryKey: ["exam-types", params],
        queryFn: async () => {
            const res = await examTypeService.getAllExamType(params);
            return res;
        },
    });
};

export function useCreateExamType() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => examTypeService.createExamType(data),
        onSuccess: () => {
            toast.success("Exam Type created successfully!");
            queryClient.invalidateQueries({ queryKey: ["exam-types"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create exam type .");
        }
    })
}

export function useGetExamTypeById(
    examtypeId: number,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ["examtype-detail", examtypeId],
        queryFn: () => examTypeService.getExamTypeById(examtypeId),
        ...options,
    });
}

export const useUpdateExamType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({examtypeId, data}: {examtypeId: number; data: any}) => examTypeService.updateExamType(examtypeId, data),
        onSuccess: () => {
            toast.success("Exam Type updated successfully!")
            queryClient.invalidateQueries({ queryKey: ["exam-types"] });
            queryClient.invalidateQueries({ queryKey: ["examtype-detail"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update exam type.");
        }
    })
}

export const useDeleteExamType = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (examtypeId: number) => examTypeService.deleteExamType(examtypeId),
        onSuccess: () => {
            toast.success("Exam Type deleted successfully!")
            queryClient.invalidateQueries({ queryKey: ["exam-types"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete exam type.");
        }
    })
}

