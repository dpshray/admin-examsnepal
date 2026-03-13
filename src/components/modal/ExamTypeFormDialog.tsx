'use client'

import { useEffect } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Tag, Pencil, Loader2 } from "lucide-react"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TextInputField from "@/components/field/TextInputField"
import { useCreateExamType, useUpdateExamType } from "@/hooks/useExamTypes"
import { Switch } from "../ui/switch"

const examTypeSchema = z.object({
    name: z.string().min(1, "Name is required"),
    is_active: z.boolean(),
})

type ExamTypeFormValues = z.infer<typeof examTypeSchema>

interface ExamTypeData {
    id: number
    name: string
    is_active: boolean
}

interface ExamTypeFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    examType?: ExamTypeData | null
}

export default function ExamTypeFormDialog({ open, onOpenChange, examType }: ExamTypeFormDialogProps) {
    const isEditing = !!examType
    const { mutateAsync: createExamType, isPending: createPending } = useCreateExamType()
    const { mutateAsync: updateExamType, isPending: updatePending } = useUpdateExamType()
    const isPending = createPending || updatePending

    const {
        register,
        handleSubmit,
        reset,
        watch,
        setValue,
        formState: { errors },
    } = useForm<ExamTypeFormValues>({
        resolver: zodResolver(examTypeSchema),
        defaultValues: { name: "", is_active: true },
    })

    useEffect(() => {
        if (open) {
            reset(examType ? { name: examType.name, is_active: examType.is_active } : { name: "", is_active: true })        
        }
    }, [open, examType, reset])

    const onSubmit = async (values: ExamTypeFormValues) => {
        if (isEditing) {
            await updateExamType(
                { examtypeId: examType.id, data: values },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            await createExamType(values, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] max-w-md overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditing
                            ? <><Pencil className="h-5 w-5 text-blue-500" /> Edit Exam Type</>
                            : <><Tag className="h-5 w-5 text-green-500" /> Add Exam Type</>
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <TextInputField
                        label="Name"
                        placeholder="e.g. MCQ"
                        required
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <div className="flex items-center justify-between rounded-lg border p-3">
                        <div>
                            <p className="text-sm font-medium">Active</p>
                            <p className="text-xs text-muted-foreground">Whether this exam type is active</p>
                        </div>
                        <Switch
                            checked={watch("is_active")}
                            onCheckedChange={(val) => setValue("is_active", val)}
                        />
                    </div>

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditing ? "Saving..." : "Adding..."}</>
                            ) : isEditing ? "Save Changes" : "Add Exam Type"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}