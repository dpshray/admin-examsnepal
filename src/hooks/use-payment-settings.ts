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

//promo-code
export function useGetPromoCodes(params?: PageParams) {
  return useQuery({
    queryKey: ["promo-codes", params],
    queryFn: () => paymentService.getPromoCodes(params),
  });
}

export function useAddPromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => paymentService.addPromoCode(data),
    onSuccess: () => {
      toast.success("Promo code added successfully");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to add promo code");
    },
  });
}

export function useUpdatePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      paymentService.updatePromoCode(id, data),
    onSuccess: () => {
      toast.success("Promo code updated successfully");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to update promo code");
    },
  });
}

export function useDeletePromoCode() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => paymentService.deletePromoCode(id),
    onSuccess: () => {
      toast.success("Promo code deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["promo-codes"] });
    },
    onError: (error: any) => {
      toast.error(error?.message || "Failed to delete promo code");
    },
  });
}
