"use client"

import * as React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import TextInputField from "../field/TextInputField"
import { useGetBlogCategoryBySlug } from "@/hooks/useBlogCategory"

const categorySchema = z.object({
    title: z.string().min(1, "Category title is required"),
})

const updateCategorySchema = categorySchema.partial()

type CategoryValues = z.infer<typeof categorySchema> | z.infer<typeof updateCategorySchema>

interface CategoryFormProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (data: CategoryValues) => Promise<void> | void
    slug?: string
    isLoading?: boolean
}

export function CategoryFormModal({
    open,
    onCloseAction,
    onSubmitAction,
    slug,
    isLoading = false,
}: CategoryFormProps) {
    const isEditMode = Boolean(slug)

    const { register, handleSubmit, reset, formState: { errors, isSubmitting, isDirty } } =
        useForm<CategoryValues>({
            resolver: zodResolver(isEditMode ? updateCategorySchema : categorySchema),
            defaultValues: {
                title: "",
            },
        })
        
    const { data: categoryDetails, isLoading: isFetching } = useGetBlogCategoryBySlug(slug || "")

    React.useEffect(() => {
        if (open && categoryDetails) {
            reset({
                title: categoryDetails.title,
            })
        }
        if (!open) reset()
    }, [open, categoryDetails, reset])

    const handleFormSubmit = async (data: CategoryValues) => {
        await onSubmitAction(data)
        reset()
        onCloseAction()
    }

    const disabled = isSubmitting || isLoading || isFetching

    return (
        <Dialog open={open} onOpenChange={onCloseAction}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>{isEditMode ? "Edit Category" : "Create Category"}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-5">
                    <TextInputField
                        {...register("title")}
                        label="Category Title"
                        placeholder="Enter category title"
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
