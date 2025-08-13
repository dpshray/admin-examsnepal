"use client"

import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Textarea} from "@/components/ui/textarea"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Alert, AlertDescription} from "@/components/ui/alert"
import {useEffect, useId, useState} from "react"
import {examService} from "@/service/exam.service"
import SelectInputField from "@/components/form/SelectInputField"
import {AlertCircle, Loader2} from "lucide-react"

const examSchema = yup
    .object({
        exam_type_id: yup.number().required("Exam type is required"),
        category_type: yup.number().required("Category is required"),
        exam_name: yup
            .string()
            .required("Title is required")
            .min(3, "Title must be at least 3 characters")
            .max(100, "Title must not exceed 100 characters"),
        description: yup
            .string()
            .required("Description is required")
            .min(10, "Description must be at least 10 characters")
            .max(500, "Description must not exceed 500 characters"),
        publish: yup.boolean().required("Active status is required"),
    })
    .required()

type ExamFormData = yup.InferType<typeof examSchema>

interface Option {
    value: number
    label: string
}

interface ExamType {
    id: number
    name: string
}

interface Category {
    id: number
    name: string
}

interface ExamModalProps {
    isOpen: boolean
    onClose: () => void
    onSubmitAction: (data: ExamFormData) => Promise<void> | void
}

interface ErrorState {
    message: string
    type: "fetch" | "submit"
}

export function ExamModal({isOpen, onClose, onSubmitAction}: ExamModalProps) {
    const descriptionId = useId()
    const errorId = useId()

    const {
        register,
        handleSubmit,
        setValue,
        watch,
        reset,
        formState: {errors, isSubmitting},
    } = useForm<ExamFormData>({
        resolver: yupResolver(examSchema),
        defaultValues: {
            exam_type_id: undefined,
            category_type: undefined,
            exam_name: "",
            description: "",
            publish: true,
        },
    })

    const [examTypeOptions, setExamTypeOptions] = useState<Option[]>([])
    const [categoryOptions, setCategoryOptions] = useState<Option[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<ErrorState | null>(null)

    const exam_type_id = watch("exam_type_id")
    const category_type = watch("category_type")
    const publish = watch("publish")

    useEffect(() => {
        if (!isOpen) return

        async function fetchOptions() {
            setIsLoading(true)
            setError(null)

            try {
                const [types, categories] = await Promise.all([examService.getExamType(), examService.examCategory()])

                setExamTypeOptions(
                    (types ?? []).map((item: ExamType) => ({
                        value: item.id,
                        label: item.name,
                    }))
                )

                setCategoryOptions(
                    (categories ?? []).map((item: Category) => ({
                        value: item.id,
                        label: item.name,
                    }))
                )
            } catch (e) {
                console.error('Error fetching options:', e)
                setError({
                    message: "Failed to load exam options. Please try again.",
                    type: "fetch",
                })
            } finally {
                setIsLoading(false)
            }
        }

        fetchOptions()
    }, [isOpen])

    const onSubmit = async (data: ExamFormData) => {
        setError(null)

        try {
            await onSubmitAction(data)
            reset()
            onClose()
        } catch {
            setError({
                message: "Failed to create exam. Please try again.",
                type: "submit",
            })
        }
    }

    const handleClose = () => {
        reset()
        setError(null)
        onClose()
    }

    const handleRetry = () => {
        if (!isOpen) return

        setIsLoading(true)
        setError(null)

        Promise.all([examService.getExamType(), examService.examCategory()])
            .then(([types, categories]) => {
                setExamTypeOptions(
                    (types ?? []).map((item: ExamType) => ({
                        value: item.id,
                        label: item.name,
                    }))
                )
                setCategoryOptions(
                    (categories ?? []).map((item: Category) => ({
                        value: item.id,
                        label: item.name,
                    }))
                )
            })
            .catch(() => {
                setError({
                    message: "Failed to load exam options. Please try again.",
                    type: "fetch",
                })
            })
            .finally(() => setIsLoading(false))
    }

    return (
        <Dialog
            open={isOpen}
            onOpenChange={(open) => !open && handleClose()}
            aria-labelledby="create-exam-title"
            aria-describedby={descriptionId}
        >
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle id="create-exam-title">Create New Exam</DialogTitle>
                </DialogHeader>

                {error && (
                    <Alert variant="destructive" className="mb-4" role="alert" aria-describedby={errorId}>
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription id={errorId} className="flex items-center space-x-2">
                            <span>{error.message}</span>
                            {error.type === "fetch" && (
                                <Button variant="outline" size="sm" onClick={handleRetry}
                                        className="ml-2 bg-transparent" disabled={isLoading}>
                                    Retry
                                </Button>
                            )}
                        </AlertDescription>
                    </Alert>
                )}

                {isLoading && (
                    <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
                        <Loader2 className="h-6 w-6 animate-spin mr-2"/>
                        <span>Loading exam options...</span>
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
                    <SelectInputField
                        name="exam_type_id"
                        label="Exam Type"
                        placeholder="Select Exam Type"
                        required
                        options={examTypeOptions}
                        value={exam_type_id}
                        onChange={(value) => setValue("exam_type_id", Number(value), {shouldValidate: true})}
                        error={errors.exam_type_id?.message}
                        disabled={isLoading || isSubmitting}
                    />

                    <SelectInputField
                        name="category_type"
                        label="Category"
                        placeholder="Select Category"
                        required
                        options={categoryOptions}
                        value={category_type}
                        onChange={(value) => setValue("category_type", Number(value), {shouldValidate: true})}
                        error={errors.category_type?.message}
                        disabled={isLoading || isSubmitting}
                    />

                    <div className="space-y-2">
                        <Label htmlFor="exam_name">
                            Title{" "}
                            <span className="text-red-500" aria-label="required">
                *
              </span>
                        </Label>
                        <Input
                            id="exam_name"
                            placeholder="Enter exam title"
                            {...register("exam_name")}
                            aria-invalid={!!errors.exam_name}
                            disabled={isSubmitting}
                            maxLength={100}
                            aria-describedby={errors.exam_name ? `${descriptionId}-error` : undefined}
                        />
                        {errors.exam_name && (
                            <p id={`${descriptionId}-error`} className="text-sm text-red-600" role="alert">
                                {errors.exam_name.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="description">
                            Description{" "}
                            <span className="text-red-500" aria-label="required">
                *
              </span>
                        </Label>
                        <Textarea
                            id="description"
                            placeholder="Enter exam description"
                            rows={4}
                            {...register("description")}
                            aria-describedby={descriptionId}
                            aria-invalid={!!errors.description}
                            disabled={isSubmitting}
                            maxLength={500}
                        />
                        {errors.description && (
                            <p id={descriptionId} className="text-sm text-red-600" role="alert">
                                {errors.description.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center justify-between space-y-2">
                        <div className="space-y-1">
                            <Label htmlFor="publish" className="text-sm font-medium">
                                Active Status
                            </Label>
                            <p className="text-sm text-muted-foreground" id="publish-description">
                                Enable this exam to make it available to students
                            </p>
                        </div>
                        <Switch
                            id="publish"
                            checked={publish}
                            onCheckedChange={(checked) => setValue("publish", checked, {shouldValidate: true})}
                            className={'data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500'}
                            disabled={isSubmitting}
                            aria-describedby="publish-description"
                        />
                    </div>
                    {errors.publish && (
                        <p className="text-sm text-red-600" role="alert">
                            {errors.publish.message}
                        </p>
                    )}

                    <div className="flex justify-end space-x-3 pt-4 border-t">
                        <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || isLoading} className="min-w-[120px]">
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/>
                                    Creating...
                                </>
                            ) : (
                                "Create Exam"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
