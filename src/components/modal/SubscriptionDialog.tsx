"use client"

import { useEffect, useMemo } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { studentService } from "@/service/student.service"
import TextInputField from "../field/TextInputField"
import SelectInputField from "../field/SelectInputField"
import { toast } from "sonner"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { AlertCircle, Loader2 } from "lucide-react"

interface SubscriptionFormData {
    subscription_type_id: number
    remark: string
}

interface SubscriptionDialogProps {
    student: {
        id: number
        name: string
        email: string
    } | null
    isOpen: boolean
    onClose: () => void
    onSuccess?: () => void
}

const subscriptionSchema = yup.object({
    subscription_type_id: yup.number().required("Subscription type is required").min(1, "Please select a subscription type"),
    remark: yup.string().required("Remark is required").min(3, "Remark must be at least 3 characters"),
})

export default function SubscriptionDialog({ student, isOpen, onClose, onSuccess }: SubscriptionDialogProps) {
    const queryClient = useQueryClient()

    const { register, handleSubmit: formHandleSubmit, formState: { errors, isSubmitting }, setValue, watch, reset } = useForm<SubscriptionFormData>({
        resolver: yupResolver(subscriptionSchema),
        defaultValues: { subscription_type_id: 0, remark: "" },
    })

    const formData = watch()

    const { data: subscriptionData, isLoading, error } = useQuery({
        queryKey: ["subscriptionTypes", student?.id],
        queryFn: async () => {
            if (!student?.id) return []
            const response = await studentService.subscriptionType(student.id)
            return response?.data ?? []
        },
        enabled: isOpen && !!student?.id,
    })

    const subscriptionMutation = useMutation({
        mutationFn: async (data: SubscriptionFormData) => {
            if (!student?.id) throw new Error("Student ID is required")
            return await studentService.subscribeStudent(student.id, data)
        },
        onSuccess: () => {
            toast.success("Student subscribed successfully!")
            queryClient.invalidateQueries({ queryKey: ["students"] })
            queryClient.invalidateQueries({ queryKey: ["subscriptions"] })
            onSuccess?.()
            handleClose()
        },
        onError: (error: any) => {
            const errorMessage = error?.response?.data?.message || error?.message || "Failed to subscribe student. Please try again."
            toast.error(errorMessage)
        },
    })

    const subscriptionOptions = useMemo(() => {
        if (!subscriptionData || subscriptionData.length === 0) return []
        return subscriptionData.map((type: any) => ({
            value: type.subscription_type_id,
            label: `${type.duration} month${type.duration > 1 ? "s" : ""} - Rs ${type.price}`,
        }))
    }, [subscriptionData])

    const handleClose = () => {
        reset()
        onClose()
    }

    const handleSubmit = async (data: SubscriptionFormData) => {
        await subscriptionMutation.mutateAsync(data)
    }

    useEffect(() => {
        if (isOpen && subscriptionOptions.length > 0 && !formData.subscription_type_id) {
            setValue("subscription_type_id", subscriptionOptions[0].value)
        }
    }, [isOpen, subscriptionOptions, formData.subscription_type_id, setValue])

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-md p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl">
                        Subscribe {student?.name ?? "Student"}
                    </DialogTitle>
                    <DialogDescription className="text-sm">
                        Please select a subscription type and add a remark if needed.
                    </DialogDescription>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                        <span className="ml-2 text-sm text-muted-foreground">Loading subscription types...</span>
                    </div>
                )}

                {error && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>
                            Failed to load subscription types. Please try again.
                        </AlertDescription>
                    </Alert>
                )}

                {!isLoading && !error && (
                    <form onSubmit={formHandleSubmit(handleSubmit)} className="space-y-4">
                        <SelectInputField
                            label="Subscription Type"
                            placeholder="Select subscription type"
                            required
                            options={subscriptionOptions}
                            value={formData.subscription_type_id ?? 0}
                            onChangeAction={(value) => setValue("subscription_type_id", Number(value))}
                            disabled={isSubmitting}
                            error={errors.subscription_type_id?.message}
                        />

                        <TextInputField
                            label="Remark"
                            placeholder="Enter remark"
                            textarea
                            rows={4}
                            required
                            {...register("remark")}
                            error={errors.remark?.message}
                            disabled={isSubmitting}
                        />

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting} className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        Submitting...
                                    </>
                                ) : "Submit"}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
}
