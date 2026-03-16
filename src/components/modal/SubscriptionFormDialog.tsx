'use client'

import { useEffect, useMemo } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { CreditCard, Pencil, Loader2 } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import TextInputField from "@/components/field/TextInputField"
import SelectInputField from "@/components/field/SelectInputField"
import { useCreateSubscription, useUpdateSubscription } from "@/hooks/useSubscription"
import { useExamTypes } from "@/hooks/useExamTypes"

const subscriptionSchema = z.object({
    exam_type_id: z.number().min(1, "Exam type is required"),
    duration: z.number().min(1, "Duration is required"),
    price: z.string().min(1, "Price is required"),
    status: z.boolean(),
})

type SubscriptionFormValues = z.infer<typeof subscriptionSchema>

interface SubscriptionData {
    id: number
    exam_type_id: number
    duration: number
    price: string
    status: boolean
    exam_type: string
}

interface SubscriptionFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    subscription?: SubscriptionData | null
}

export default function SubscriptionFormDialog({ open, onOpenChange, subscription }: SubscriptionFormDialogProps) {
    const isEditing = !!subscription
    const { mutateAsync: createSubscription, isPending: createPending } = useCreateSubscription()
    const { mutateAsync: updateSubscription, isPending: updatePending } = useUpdateSubscription()
    const isPending = createPending || updatePending

    const { data: examTypeData } = useExamTypes()
    const examTypes = examTypeData?.data?.data ?? []

    const examTypeOptions = useMemo(() =>
        examTypes.map((et: { id: number; name: string }) => ({
            label: et.name,
            value: et.id,
        })), [examTypes])

    const {
        register,
        handleSubmit,
        reset,
        setValue,
        watch,
        formState: { errors },
    } = useForm<SubscriptionFormValues>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            exam_type_id: 0,
            duration: 1,
            price: "",
            status: true,
        },
    })

    useEffect(() => {
        if (open) {
            reset(subscription ? {
                exam_type_id: subscription.exam_type_id,
                duration: subscription.duration,
                price: subscription.price,
                status: Boolean(subscription.status),
            } : {
                exam_type_id: 0,
                duration: 1,
                price: "",
                status: true,
            })
        }
    }, [open, subscription, reset])

    const onSubmit = async (values: SubscriptionFormValues) => {
        if (isEditing) {
            await updateSubscription(
                { subscriptionId: subscription!.id, data: values },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            await createSubscription(values, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] max-w-md overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditing
                            ? <><Pencil className="h-5 w-5 text-blue-500" /> Edit Subscription Plan</>
                            : <><CreditCard className="h-5 w-5 text-green-500" /> Add Subscription Plan</>
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <SelectInputField
                        label="Exam Type"
                        placeholder="Select exam type"
                        options={examTypeOptions}
                        value={watch("exam_type_id")}
                        onChangeAction={(val) => setValue("exam_type_id", Number(val), { shouldValidate: true })}
                        error={errors.exam_type_id?.message}
                        showAll={false}
                        required
                    />

                    <TextInputField
                        label="Duration (months)"
                        placeholder="e.g. 1, 3, 6, 12"
                        type="number"
                        required
                        error={errors.duration?.message}
                        {...register("duration", { valueAsNumber: true })}
                    />

                    <TextInputField
                        label="Price"
                        placeholder="e.g. 999.00"
                        required
                        error={errors.price?.message}
                        {...register("price")}
                    />

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div className="space-y-0.5">
                            <Label className="text-sm font-medium">Status</Label>
                            <p className="text-xs text-muted-foreground">
                                {watch("status") ? "This plan is currently active" : "This plan is currently inactive"}
                            </p>
                        </div>
                        <Switch
                            checked={watch("status")}
                            onCheckedChange={(checked) => setValue("status", checked, { shouldValidate: true })}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditing ? "Saving..." : "Adding..."}</>
                            ) : isEditing ? "Save Changes" : "Add Plan"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}