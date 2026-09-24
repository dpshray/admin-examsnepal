import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { GetParams, QUERY_STALE_TIME } from "@/config/app-constant";
import { noticeService } from "@/service/notice.service";

const errorMessage = (error: any, fallback: string) => error?.message || fallback;

export function useNoticeMeta() {
  return useQuery({
    queryKey: ["notice-meta"],
    queryFn: () => noticeService.getMeta(),
    staleTime: 10 * 60 * 1000,
  });
}

export function useNoticeStats() {
  return useQuery({
    queryKey: ["notice-stats"],
    queryFn: () => noticeService.getStats(),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useNotices(params?: GetParams) {
  return useQuery({
    queryKey: ["notices", params],
    queryFn: () => noticeService.getNotices(params),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useNotice(id?: number | string) {
  return useQuery({
    queryKey: ["notice", String(id)],
    queryFn: () => noticeService.getNotice(id!),
    enabled: !!id,
  });
}

function useInvalidateNotices() {
  const queryClient = useQueryClient();
  return () => {
    queryClient.invalidateQueries({ queryKey: ["notices"] });
    queryClient.invalidateQueries({ queryKey: ["notice"] });
    queryClient.invalidateQueries({ queryKey: ["notice-stats"] });
  };
}

export function useSaveNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Record<string, unknown> }) =>
      id ? noticeService.updateNotice(id, data) : noticeService.createNotice(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Notice saved");
      invalidate();
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to save notice")),
  });
}

export function useNoticeAction() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: ({ id, action }: { id: number; action: "approve" | "reject" | "feature" | "re-enrich" }) =>
      noticeService.noticeAction(id, action),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Done");
      invalidate();
    },
    onError: (error: any) => toast.error(errorMessage(error, "Action failed")),
  });
}

export function useDeleteNotice() {
  const invalidate = useInvalidateNotices();
  return useMutation({
    mutationFn: (id: number) => noticeService.deleteNotice(id),
    onSuccess: () => {
      toast.success("Notice deleted");
      invalidate();
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to delete notice")),
  });
}

export function useNoticeReports(params?: GetParams) {
  return useQuery({
    queryKey: ["notice-reports", params],
    queryFn: () => noticeService.getReports(params),
  });
}

export function useResolveReport() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticeService.resolveReport(id),
    onSuccess: () => {
      toast.success("Report resolved");
      queryClient.invalidateQueries({ queryKey: ["notice-reports"] });
      queryClient.invalidateQueries({ queryKey: ["notice-stats"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to resolve report")),
  });
}

// ---- sources
export function useNoticeSources(params?: GetParams) {
  return useQuery({
    queryKey: ["notice-sources", params],
    queryFn: () => noticeService.getSources(params),
    staleTime: QUERY_STALE_TIME,
  });
}

export function useSaveNoticeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id?: number; data: Record<string, unknown> }) =>
      id ? noticeService.updateSource(id, data) : noticeService.createSource(data),
    onSuccess: (res: any) => {
      toast.success(res?.message || "Source saved");
      queryClient.invalidateQueries({ queryKey: ["notice-sources"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to save source")),
  });
}

export function useDeleteNoticeSource() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticeService.deleteSource(id),
    onSuccess: () => {
      toast.success("Source deleted");
      queryClient.invalidateQueries({ queryKey: ["notice-sources"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to delete source")),
  });
}

export function useTestFetch() {
  return useMutation({
    mutationFn: ({ id, data }: { id: number | null; data?: Record<string, unknown> }) =>
      noticeService.testFetch(id, data),
    onError: (error: any) => toast.error(errorMessage(error, "Test fetch failed")),
  });
}

export function useFetchNow() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => noticeService.fetchNow(id),
    onSuccess: () => {
      toast.success("Fetch queued - check the logs in a minute");
      queryClient.invalidateQueries({ queryKey: ["notice-fetch-logs"] });
    },
    onError: (error: any) => toast.error(errorMessage(error, "Failed to queue fetch")),
  });
}

export function useNoticeFetchLogs(params?: GetParams) {
  return useQuery({
    queryKey: ["notice-fetch-logs", params],
    queryFn: () => noticeService.getFetchLogs(params),
    refetchInterval: 30_000,
  });
}
