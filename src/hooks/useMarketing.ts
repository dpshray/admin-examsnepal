import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetParams, QUERY_STALE_TIME } from "@/config/app-constant";
import { marketingService } from "@/service/marketing.service";
import type { StudentFilters } from "@/types/Marketing";

const errorMessage = (error: any, fallback: string) => error?.message || fallback;

export function useMarketingOverview(params: { from: string; to: string; exam_type_id?: string }) {
  return useQuery({
    queryKey: ["marketing-overview", params],
    queryFn: () => marketingService.getOverview(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useMarketingCohorts(params: { weeks: number; exam_type_id?: string }) {
  return useQuery({
    queryKey: ["marketing-cohorts", params],
    queryFn: () => marketingService.getCohorts(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useMarketingMeta() {
  return useQuery({
    queryKey: ["marketing-meta"],
    queryFn: () => marketingService.getMeta(),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMarketingStudents(params: GetParams) {
  return useQuery({
    queryKey: ["marketing-students", params],
    queryFn: () => marketingService.getStudents(params),
    staleTime: QUERY_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

export function useMarketingStudent(id?: number | null) {
  return useQuery({
    queryKey: ["marketing-student", id],
    queryFn: () => marketingService.getStudent(id!),
    enabled: !!id,
  });
}

export function useSaveSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, filters }: { name: string; filters: StudentFilters }) => marketingService.saveSegment(name, filters),
    onSuccess: () => {
      toast.success("Segment saved");
      queryClient.invalidateQueries({ queryKey: ["marketing-meta"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to save segment")),
  });
}

export function useDeleteSegment() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => marketingService.deleteSegment(id),
    onSuccess: () => {
      toast.success("Segment deleted");
      queryClient.invalidateQueries({ queryKey: ["marketing-meta"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to delete segment")),
  });
}

export function useTagStudents() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketingService.tagStudents.bind(marketingService),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Tags updated");
      queryClient.invalidateQueries({ queryKey: ["marketing-students"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-student"] });
      queryClient.invalidateQueries({ queryKey: ["marketing-meta"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to update tags")),
  });
}

// ---- email automation

export function useMessagingStatus() {
  return useQuery({
    queryKey: ["marketing-messaging-status"],
    queryFn: () => marketingService.getMessagingStatus(),
    refetchInterval: 60_000,
  });
}

export function useSetPaused() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paused: boolean) => marketingService.setPaused(paused),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Updated");
      queryClient.invalidateQueries({ queryKey: ["marketing-messaging-status"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to update kill switch")),
  });
}

export function useAutomations(days: number) {
  return useQuery({
    queryKey: ["marketing-automations", days],
    queryFn: () => marketingService.getAutomations(days),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useUpdateAutomation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: Record<string, unknown> }) => marketingService.updateAutomation(id, data),
    onSuccess: () => {
      toast.success("Automation updated");
      queryClient.invalidateQueries({ queryKey: ["marketing-automations"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to update automation")),
  });
}

export function useAutomationPreview(id: number | null) {
  return useQuery({
    queryKey: ["marketing-automation-preview", id],
    queryFn: () => marketingService.previewAutomation(id!),
    enabled: !!id,
    staleTime: 0,
  });
}

export function useSends(params: GetParams) {
  return useQuery({
    queryKey: ["marketing-sends", params],
    queryFn: () => marketingService.getSends(params),
    placeholderData: keepPreviousData,
  });
}

export function useSuppressions(params: GetParams) {
  return useQuery({
    queryKey: ["marketing-suppressions", params],
    queryFn: () => marketingService.getSuppressions(params),
    placeholderData: keepPreviousData,
  });
}

export function useSuppressionMutations() {
  const queryClient = useQueryClient();
  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["marketing-suppressions"] });
  return {
    add: useMutation({
      mutationFn: (email: string) => marketingService.addSuppression(email),
      onSuccess: () => { toast.success("Address suppressed"); invalidate(); },
      onError: (error: any) => toast.error(errorMessage(error, "Failed to add")),
    }),
    remove: useMutation({
      mutationFn: (id: number) => marketingService.removeSuppression(id),
      onSuccess: () => { toast.success("Suppression removed"); invalidate(); },
      onError: (error: any) => toast.error(errorMessage(error, "Failed to remove")),
    }),
  };
}

// ---- templates, A/B, broadcasts

export function useEmailTemplates() {
  return useQuery({ queryKey: ["marketing-templates"], queryFn: () => marketingService.getTemplates(), staleTime: QUERY_STALE_TIME });
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ key, data }: { key: string | null; data: Record<string, unknown> }) => marketingService.saveTemplate(key, data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Template saved");
      queryClient.invalidateQueries({ queryKey: ["marketing-templates"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to save template")),
  });
}

export function useDeleteTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (key: string) => marketingService.deleteTemplate(key),
    onSuccess: () => {
      toast.success("Template deleted");
      queryClient.invalidateQueries({ queryKey: ["marketing-templates"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to delete template")),
  });
}

export function useSendTestTemplate() {
  return useMutation({
    mutationFn: ({ key, studentId }: { key: string; studentId?: number }) => marketingService.sendTestTemplate(key, studentId),
    onSuccess: (res: any) => toast.success(res?.message || "Test sent"),
    onError: (error: any) => toast.error(errorMessage(error, "Failed to send test")),
  });
}

export function usePromoteVariant() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, variant }: { id: number; variant: "A" | "B" }) => marketingService.promoteVariant(id, variant),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Variant promoted");
      queryClient.invalidateQueries({ queryKey: ["marketing-automations"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to promote variant")),
  });
}

export function useBroadcasts() {
  return useQuery({ queryKey: ["marketing-broadcasts"], queryFn: () => marketingService.getBroadcasts(), refetchInterval: 60_000 });
}

export function useCreateBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: marketingService.createBroadcast.bind(marketingService),
    onSuccess: () => {
      toast.success("Broadcast scheduled");
      queryClient.invalidateQueries({ queryKey: ["marketing-broadcasts"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to schedule broadcast")),
  });
}

export function useCancelBroadcast() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => marketingService.cancelBroadcast(id),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Broadcast cancelled");
      queryClient.invalidateQueries({ queryKey: ["marketing-broadcasts"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to cancel")),
  });
}
