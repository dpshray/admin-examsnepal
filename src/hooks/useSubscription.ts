import { PageParams } from "@/config/app-constant";
import { subscriptionService } from "@/service/subscription.service";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
    import { toast } from "sonner";

export const useSubscriptions = (params?: PageParams) => {
    return useQuery({
        queryKey: ["subscription", params],
        queryFn: async () => {
            const res = await subscriptionService.getAllSubscription(params);
            return res;
        },
    });
};

export function useCreateSubscription() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: any) => subscriptionService.createSubscription(data),
        onSuccess: () => {
            toast.success("Subscription created successfully!");
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to create subscription.");
        }
    })
}

export function useGetSubscriptionById(
    subscriptionId: number,
    options?: { enabled?: boolean }
) {
    return useQuery({
        queryKey: ["subscription-detail", subscriptionId],
        queryFn: () => subscriptionService.getSubscriptionById(subscriptionId),
        ...options,
    });
}

export const useUpdateSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: async ({subscriptionId, data}: {subscriptionId: number; data: any}) => subscriptionService.updateSubscription(subscriptionId, data),
        onSuccess: () => {
            toast.success("Subscription updated successfully!")
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
            queryClient.invalidateQueries({ queryKey: ["subscription-detail"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to update subscription .");
        }
    })
}

export const useDeleteSubscription = () => {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (subscriptionId: number) => subscriptionService.deleteSubscription(subscriptionId),
        onSuccess: () => {
            toast.success("Subscription deleted successfully!")
            queryClient.invalidateQueries({ queryKey: ["subscription"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Failed to delete subscription .");
        }
    })
}

