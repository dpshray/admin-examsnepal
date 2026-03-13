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
import { useCreateExamTag, useUpdateExamTag } from "@/hooks/useExamTags"

const examTagSchema = z.object({
    name: z.string().min(1, "Name is required"),
})

type ExamTagFormValues = z.infer<typeof examTagSchema>

interface ExamTagData {
    id: number
    name: string
    slug: string
}

interface ExamTagFormDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    examTag?: ExamTagData | null
}

export default function ExamTagFormDialog({ open, onOpenChange, examTag }: ExamTagFormDialogProps) {
    const isEditing = !!examTag
    const { mutateAsync: createExamTag, isPending: createPending } = useCreateExamTag()
    const { mutateAsync: updateExamTag, isPending: updatePending } = useUpdateExamTag()
    const isPending = createPending || updatePending

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<ExamTagFormValues>({
        resolver: zodResolver(examTagSchema),
        defaultValues: { name: "" },
    })

    useEffect(() => {
        if (open) {
            reset(examTag ? { name: examTag.name } : { name: "" })
        }
    }, [open, examTag, reset])

    const onSubmit = async (values: ExamTagFormValues) => {
        if (isEditing) {
            await updateExamTag(
                { examtagSlug: examTag!.slug, data: values },
                { onSuccess: () => onOpenChange(false) }
            )
        } else {
            await createExamTag(values, { onSuccess: () => onOpenChange(false) })
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-h-[95vh] max-w-md overflow-auto">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        {isEditing
                            ? <><Pencil className="h-5 w-5 text-blue-500" /> Edit Exam Tag</>
                            : <><Tag className="h-5 w-5 text-green-500" /> Add Exam Tag</>
                        }
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
                    <TextInputField
                        label="Name"
                        placeholder="e.g. IELTS"
                        required
                        error={errors.name?.message}
                        {...register("name")}
                    />

                    <DialogFooter>
                        <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isPending}>
                            {isPending ? (
                                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />{isEditing ? "Saving..." : "Adding..."}</>
                            ) : isEditing ? "Save Changes" : "Add Exam Tag"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}