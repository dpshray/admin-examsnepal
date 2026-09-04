"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import TextInputField from "../field/TextInputField"
import { useGetBlogTagBySlug } from "@/hooks/useBlogTag"

const tagSchema = z.object({
    title: z.string().min(1, "Tag title is required"),
})

const updateTagSchema = tagSchema.partial()

type TagValues = z.infer<typeof tagSchema> | z.infer<typeof updateTagSchema>

interface TagFormProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (data: TagValues) => Promise<void> | void
    slug?: string
    isLoading?: boolean
}

export function TagFormModal({
    open,
    onCloseAction,
    onSubmitAction,
    slug,
    isLoading = false,
}: TagFormProps) {
    const isEditMode = Boolean(slug)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
        useForm<TagValues>({
            resolver: zodResolver(isEditMode ? updateTagSchema : tagSchema),
            defaultValues: {
                title: "",
            },
        })
        
    const { data: tagDetails, isLoading: isFetching } = useGetBlogTagBySlug(slug || "")

    React.useEffect(() => {
        if (open && tagDetails) {
            reset({
                title: tagDetails.title,
            })
        }
        if (!open) reset()
    }, [open, tagDetails, reset])

    const handleFormSubmit = async (data: TagValues) => {
        await onSubmitAction(data)
        reset()
        onCloseAction()
    }

    const disabled = isSubmitting || isLoading || isFetching

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Tag" : "Create Tag"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <TextInputField
                        {...register("title")}
                        label="Tag Title"
                        placeholder="Enter tag title"
                        error={errors.title?.message}
                        disabled={disabled}
                        required
                    />

                    <DialogFooter className="pt-4 border-t">
                        <Button variant="outline" type="button" onClick={onCloseAction} disabled={disabled}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={disabled || (!isDirty && isEditMode)}>
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    Saving...
                                </>
                            ) : isEditMode ? "Update" : "Create"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
