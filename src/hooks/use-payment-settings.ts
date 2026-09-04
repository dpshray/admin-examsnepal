import { paymentService } from "@/service/payment.service";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GetParams, PageParams } from "@/config/app-constant";
import { toast } from "sonner";

export function useGetPaymentSettings(params?: PageParams) {
  return useQuery({
    queryKey: ["payment-settings", params],
    queryFn: () => paymentService.getPaymentSettings(params),
  });
}

export function useUpdatePaymentSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ name, status }: { name: string; status: boolean }) =>
      paymentService.updatePaymentSettings(name, status),
    onSuccess: () => {
      toast.success("Payment settings updated successfully");
      queryClient.invalidateQueries({ queryKey: ["payment-settings"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update payment settings");
    },
  });
}
