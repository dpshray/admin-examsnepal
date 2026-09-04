'use client'

import * as React from "react"
import { useForm, Controller } from "react-hook-form"
import { z } from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import TextInputField from "../field/TextInputField"
import FileInputField from "../field/FileInputField"
import MultiSelectField from "../field/multi-select-input"
import { useGetAllBlogCategories } from "@/hooks/useBlogCategory"
import { useGetAllBlogTags } from "@/hooks/useBlogTag"
import SelectInputField from "../field/SelectInputField"
import RichTextEditor from "../field/RichTextEditor"
import { useGetAdminBlogBySlug } from "@/hooks/useBlogs"

const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB

const createBlogSchema = z.object({
    title: z.string().min(1, "Title is required").max(255),
    content: z.string().min(5, "Content is required"),
    summary: z.string().max(500).min(5, "Summary should be at least 10 characters"),
    category_id: z.array(z.string()).min(1, "Category is required"),
    tag_id: z.array(z.string()).min(1, "Tag is required"),
    slug: z.string().optional(),
    author: z.string().min(1, "Author is required"),
    published_date: z.string().min(1, "Published date is required"),
    status: z.enum(["draft", "published", "scheduled", "archived"]),
    cta_text: z.string().optional(),
    cta_link: z.string().url().optional(),
    image: z
    .instanceof(File)
    .refine((file) => file.size <= MAX_FILE_SIZE, "Image size must be less than 1MB")
});

const updateBlogSchema = createBlogSchema.partial({
    image: true 
});

type BlogFormValues = z.infer<typeof createBlogSchema> | z.infer<typeof updateBlogSchema>

interface BlogFormModalProps {
    open: boolean
    onCloseAction: () => void
    onSubmitAction: (data: BlogFormValues) => Promise<void> | void
    slug?: string
    isLoading?: boolean
}

export function BlogFormModal({
    open,
    onCloseAction,
    onSubmitAction,
    slug,
    isLoading = false,
}: BlogFormModalProps) {
    const isEditMode = Boolean(slug)

    const { control, register, handleSubmit, reset, watch, setValue, formState: { errors, isSubmitting, isDirty } } = useForm<BlogFormValues>({
        resolver: zodResolver(isEditMode ? updateBlogSchema : createBlogSchema) as any,
        defaultValues: {
            title: "",
            content: "",
            author: "",
            summary: "",
            category_id: [],
            tag_id: [],
            image: undefined,
            slug: undefined,
            published_date: undefined,
            status: "draft",
        },
    })

    const { data: blogDetails, isLoading: isFetching } = useGetAdminBlogBySlug(slug || "")
    const { data: categoriesData, isLoading: isLoadingCategories } = useGetAllBlogCategories()
    const { data: tagsData, isLoading: isLoadingTags } = useGetAllBlogTags()
    
    // const RichTextEditor = React.useMemo(
    //     () =>
    //         dynamic(() => import("@/components/field/RichTextEditor"), {
    //             ssr: false,
    //         }),
    //     []
    // );

    // Transform categories data for MultiSelectField
    const categoryOptions = React.useMemo(() => {
        if (!categoriesData?.items) return [];
        return categoriesData.items.map((cat: any) => ({
            value: cat.id.toString(),
            label: cat.title,
        }));
    }, [categoriesData]);

    // Transform tags data for MultiSelectField
    const tagOptions = React.useMemo(() => {
        if (!tagsData?.items) return [];
        return tagsData?.items.map((tag: any) => ({
            value: tag.id.toString(),
            label: tag.title,
        }));
    }, [tagsData]);

    React.useEffect(() => {
        if (open) {
            if (isEditMode && blogDetails) {
                // Edit mode → set fetched values
                reset({
                    title: blogDetails.title,
                    content: blogDetails.content,
                    summary: blogDetails.summary,
                    category_id: blogDetails.categories?.map((c: any) => c.id.toString()) || [],
                    tag_id: blogDetails.tag?.map((t: any) => t.id.toString()) || [],
                    slug: blogDetails.slug,
                    author: blogDetails.author,
                    image: undefined,
                    published_date: blogDetails.published_date,
                    status: blogDetails.status,
                    cta_text: blogDetails.cta_text,
                    cta_link: blogDetails.cta_link,
                })
            } else {
                // Create mode → reset to empty defaults
                reset({
                    title: "",
                    content: "",
                    summary: "",
                    category_id: [],
                    tag_id: [],
                    slug: undefined,
                    author: "",
                    image: undefined,
                    published_date: "",
                    status: "draft",
                    cta_text: "",
                    cta_link: "",
                })
            }
        }
    }, [open, blogDetails, reset, isEditMode])

    const handleFormSubmit = async (data: BlogFormValues) => {
        await onSubmitAction(data)
        reset()
        onCloseAction()
    }

    const handleDialogChange = (value: boolean) => {
        if (!value && !isSubmitting && !isLoading) {
            reset()
            onCloseAction()
        }
    }

    const disabled = isSubmitting || isLoading || isFetching

    return (
        <Dialog open={open} onOpenChange={handleDialogChange}>
            <DialogContent className="sm:max-w-[95vw] md:max-w-[800px] max-h-[90vh] flex flex-col overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {isEditMode ? "Edit Blog" : "Create New Blog"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
                    <TextInputField
                        {...register("title")}
                        label="Blog Title"
                        placeholder="Enter blog title (50-60 chars recommended)"
                        error={errors.title?.message}
                        disabled={disabled}
                        required={!isEditMode}
                    />
                    
                   {/* Rich Text Editor */}
                    <RichTextEditor
                        value={blogDetails?.content || ""}
                        onChange={(html: string) => setValue("content", html, { shouldValidate: true })}
                        label="Blog Content"
                        showImage={false}
                    />
                    {errors.content && (
                        <span className="text-red-500 text-sm">{errors.content.message}</span>
                    )}

                    <TextInputField
                        {...register("summary")}
                        label="Excerpt / Summary"
                        placeholder="Short summary (150-160 chars)"
                        error={errors.summary?.message}
                        disabled={disabled}
                        textarea
                        required={!isEditMode}
                    />
                    
                    {/* Category Selection */}
                    <Controller
                        name="category_id"
                        control={control}
                        render={({ field }) => (
                            <MultiSelectField
                                label="Category"
                                placeholder="Select categories"
                                options={categoryOptions}
                                value={field.value || []}
                                onValueChange={field.onChange}
                                error={errors.category_id?.message as string}
                                disabled={disabled || isLoadingCategories}
                                required={!isEditMode}
                                searchable
                                clearable
                                emptyMessage="No categories found"
                                searchPlaceholder="Search categories..."
                            />
                        )}
                    />

                    {/* Tags Selection */}
                    <Controller
                        name="tag_id"
                        control={control}
                        render={({ field }) => (
                            <MultiSelectField
                                label="Tags"
                                placeholder="Select tags"
                                options={tagOptions}
                                value={field.value || []}
                                onValueChange={field.onChange}
                                error={errors.tag_id?.message as string}
                                disabled={disabled || isLoadingTags}
                                required={!isEditMode}
                                searchable
                                clearable
                                emptyMessage="No tags found"
                                searchPlaceholder="Search tags..."
                            />
                        )}
                    />
                    
                    <TextInputField
                        {...register("author")}
                        label="Author"
                        placeholder="Author name"
                        error={errors.author?.message}
                        disabled={disabled}
                        required={!isEditMode}
                    />

                    {isEditMode &&
                        <TextInputField
                            {...register("slug")}
                            label="Slug"
                            placeholder="auto-generated from title (editable)"
                            error={errors.slug?.message}
                            disabled={disabled}
                        />
                    }
                    
                    <TextInputField
                        {...register("published_date")}
                        label="Published Date"
                        placeholder="YYYY-MM-DD"
                        type="date"
                        error={errors.published_date?.message}
                        disabled={disabled}
                        required={!isEditMode}
                    />

                    {/* Status Selection */}
                    <SelectInputField
                        label="Status"
                        placeholder="Select status"
                        name="status"
                        required={!isEditMode}
                        options={[
                            { value: "draft", label: "Draft" },
                            { value: "published", label: "Published" },
                            { value: "scheduled", label: "Scheduled" },
                            { value: "archived", label: "Archived" },
                        ]}
                        value={watch("status")}              
                        onChangeAction={(val) => setValue("status", val as "draft" | "published" | "scheduled" | "archived")}
                        error={errors.status?.message}
                        disabled={disabled}
                    />

                    {/* CTA Text */}
                    <TextInputField
                        {...register("cta_text")}
                        label="CTA Text"
                        placeholder="e.g., Read more, Contact us"
                        error={errors.cta_text?.message}
                        disabled={disabled}
                    />

                    {/* CTA Link */}
                    <TextInputField
                        {...register("cta_link")}
                        label="CTA Link"
                        placeholder="https://example.com"
                        error={errors.cta_link?.message}
                        disabled={disabled}
                    />

                    <div className={'flex flex-col gap-2'}>
                        <FileInputField
                            label={`Blog Image${isEditMode ? " (Optional)" : ""}`}
                            accept="image/*"
                            disabled={disabled}
                            onFileChange={(files: File[]) => setValue("image", files[0] || undefined)}
                            error={errors.image?.message as string}
                            required={!isEditMode}
                        />
                        <p className="text-xs text-gray-500">
                            Max size: <span className="font-semibold">1MB</span>
                        </p>
                    </div>

                    {blogDetails?.image && (
                        <div className="flex items-center gap-2">
                            <Image
                                src={blogDetails.image}
                                alt={blogDetails.title}
                                width={100}
                                height={100}
                                className="w-16 h-16 object-cover rounded-lg"
                            />
                        </div>
                    )}

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => handleDialogChange(false)}
                            disabled={disabled}
                            className="w-full sm:w-auto"
                        >
                            Cancel
                        </Button>

                        <Button
                            type="submit"
                            disabled={disabled || (!isDirty && isEditMode)}
                        >
                            {isSubmitting || isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    {isEditMode ? "Updating..." : "Creating..."}
                                </>
                            ) : isFetching ? (
                                <>
                                    <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                    Loading...
                                </>
                            ) : isEditMode ? (
                                "Update Blog"
                            ) : (
                                "Create Blog"
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}