"use client"

import { memo, useCallback, useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import SelectInputField from "@/components/field/SelectInputField"
import TextInputField from "@/components/field/TextInputField"
import { useForm } from "react-hook-form"
import { yupResolver } from "@hookform/resolvers/yup"
import * as yup from "yup"
import { toast } from "sonner"
import { AlertCircle, Clock, Loader2 } from "lucide-react"
import { useExamTypes } from "@/hooks/useExamTypes"
import { useExamCategories } from "@/hooks/useExamCategories"
import { examService } from "@/service/exam.service"
import { useExamTags } from "@/hooks/useExamTags"
import MultiSelectField from "../field/multi-select-input"

interface ExamFormData {
    exam_type_id: number
    category_type: number
    exam_name: string
    description: string
    publish: boolean
    assign: boolean
    live: boolean
    is_negative_marking: boolean
    negative_marking_point: number
    points_per_question: number
    duration: number
    exam_tags: string[]
}

interface ExamModalProps {
    isOpen: boolean
    onClose: () => void
    mode?: "create" | "update"
    onSuccessAction?: () => void
    examId?: number
}

const examSchema = yup.object({
    exam_type_id: yup.number().required("Exam type is required"),
    category_type: yup.number().required("Category is required"),
    exam_name: yup.string().required("Exam name is required").trim(),
    description: yup.string().required("Description is required").trim(),
    duration: yup.number().min(1, "Duration must be at least 1 minute").max(999, "Duration cannot exceed 999 minutes").required("Duration is required"),
    publish: yup.boolean().required(),
    assign: yup.boolean().required(),
    live: yup.boolean().required(),
    is_negative_marking: yup.boolean().required(),
    negative_marking_point: yup.number().min(0, "Must be 0 or more").required("Negative marking point is required"),
    points_per_question: yup.number().min(0, "Must be 0 or more").required("Points per question is required"),
    exam_tags: yup.array().of(yup.string().required()).default([]),
})

const SwitchField = memo(({
                              id,
                              label,
                              description,
                              checked,
                              onChange,
                              disabled
                          }: {
    id: string
    label: string
    description: string
    checked: boolean
    onChange: (checked: boolean) => void
    disabled: boolean
}) => (
    <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50 gap-3">
        <div className="space-y-0.5 flex-1 min-w-0">
            <Label htmlFor={id} className="text-sm font-medium cursor-pointer leading-tight">
                {label}
            </Label>
            <p className="text-xs text-muted-foreground leading-tight break-words">
                {description}
            </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
      <span className="text-xs font-medium text-muted-foreground hidden sm:inline">
        {checked ? "On" : "Off"}
      </span>
            <Switch
                id={id}
                checked={checked}
                onCheckedChange={onChange}
                disabled={disabled}
                aria-label={label}
            />
        </div>
    </div>
))

SwitchField.displayName = "SwitchField"

export const ExamModalForm = memo(function ExamModalForm({
                                                             isOpen,
                                                             onClose,
                                                             mode = "create",
                                                             examId,
                                                             onSuccessAction
                                                         }: ExamModalProps) {
    const [isFetchingData, setIsFetchingData] = useState(false)
    const { data: examTypesDatas, isLoading: examTypesLoading, error: examTypesError } = useExamTypes()
    const { data: examCategories, isLoading: categoriesLoading, error: categoriesError } = useExamCategories()
    const { data: examTagsData, isLoading: examTagsLoading } = useExamTags()

    const examTypesData = useMemo(() => {
        return examTypesDatas?.data?.data ?? []
    }, [examTypesDatas])

    const examTagOptions = useMemo(() =>
        examTagsData?.data?.data?.map((tag: any) => ({
            label: tag.name,
            value: tag.slug,
        })) ?? [],
        [examTagsData]
    )

    const {
        register,
        handleSubmit: formHandleSubmit,
        formState: { errors, isSubmitting },
        setValue,
        watch,
        reset
    } = useForm<ExamFormData>({
        resolver: yupResolver(examSchema),
        defaultValues: {
            exam_type_id: 0,
            category_type: 0,
            exam_name: "",
            description: "",
            publish: true,
            assign: true,
            live: true,
            is_negative_marking: false,
            negative_marking_point: 0,
            points_per_question: 0,
            duration: 0, 
            exam_tags: [],
        },
    })

    const formData = watch()

    const examTypeOptions = useMemo(() =>
            examTypesData?.map((type: any) => ({
                label: type.name,
                value: type.id
            })) ?? [],
        [examTypesData]
    )

    const categoryTypeOptions = useMemo(() =>
            examCategories?.map((category: any) => ({
                label: category.name,
                value: category.id
            })) ?? [],
        [examCategories]
    )

    const handleClose = useCallback(() => {
        reset()
        onClose()
    }, [onClose, reset])

    useEffect(() => {
        if (!isOpen || mode !== "update" || !examId) return

        const fetchExamData = async () => {
            setIsFetchingData(true)
            try {
                const response: any = await examService.getExamDetails(examId)
                console.log("rrrrrrrr", response)
                if (response) {
                    reset({
                        exam_type_id: response.exam_type_id ?? 0,
                        category_type: response.category_type ?? 0,
                        exam_name: response.exam_name ?? "",
                        description: response.description ?? "",
                        duration: response.duration ?? 0,
                        publish: response.publish ?? false,
                        assign: response.assign ?? false,
                        live: response.live ?? false,
                        is_negative_marking: response.is_negative_marking ?? false,
                        negative_marking_point: response.negative_marking_point ?? 0,
                        points_per_question: response.points_per_question ?? 0,
                        exam_tags: response.exam_tags?.map((tag: any) => tag.slug) ?? [],
                    })
                }
            } catch (error: any) {
                toast.error(error?.response?.data?.message || "Failed to load exam details")
            } finally {
                setIsFetchingData(false)
            }
        }

        fetchExamData()
    }, [isOpen, mode, examId, reset])

    useEffect(() => {
        if (!isOpen || mode !== "create") return
        if (examTypesData?.length) setValue("exam_type_id", examTypesData[0].id)
        if (examCategories?.length) setValue("category_type", examCategories[0].id)
    }, [isOpen, mode, examTypesData, examCategories, setValue])

    const handleSubmit = useCallback(async (data: ExamFormData) => {
        try {
            const payload = {
                ...data,
                is_active: data.publish,
            }

            let response
            if (mode === "update" && examId) {
                response = await examService.updateExam(examId, payload)
                toast.success(response?.message || "Exam updated successfully")
            } else {
                response = await examService.createExam(payload)
                toast.success(response?.message || "Exam created successfully")
            }

            onSuccessAction?.()
            handleClose()
        } catch (error: any) {
            const errorMessage = error?.response?.data?.message || error?.message || "Operation failed. Please try again."
            toast.error(errorMessage)
        }
    }, [mode, examId, onSuccessAction, handleClose])

    const isLoading = examTypesLoading || categoriesLoading || isFetchingData || examTagsLoading
    const hasError = !!(examTypesError || categoriesError)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-2xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {mode === "update" ? "Update Exam" : "Create New Exam"}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                )}

                {hasError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>Failed to load form data. Please try again.</AlertDescription>
                    </Alert>
                )}

                {!isLoading && !hasError && (
                    <div className="space-y-4">
                        <TextInputField
                            label="Exam Name"
                            placeholder="Enter exam name"
                            required
                            {...register("exam_name")}
                            error={errors.exam_name?.message}
                            disabled={isSubmitting}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <SelectInputField
                                label="Exam Type"
                                placeholder="Select exam type"
                                showAll={false}
                                options={examTypeOptions}
                                value={formData.exam_type_id}
                                onChangeAction={(value) => setValue("exam_type_id", Number(value))}
                                disabled={isSubmitting}
                                required
                                error={errors.exam_type_id?.message}
                            />
                            <SelectInputField
                                label="Category"
                                placeholder="Select category"
                                showAll={false}
                                options={categoryTypeOptions}
                                value={formData.category_type}
                                onChangeAction={(value) => setValue("category_type", Number(value))}
                                disabled={isSubmitting}
                                required
                                error={errors.category_type?.message}
                            />
                        </div>

                        <MultiSelectField
                            label="Exam Tags"
                            placeholder="Select exam tags"
                            options={examTagOptions}
                            value={formData.exam_tags}
                            onValueChange={(val) => setValue("exam_tags", val as string[])}
                            disabled={isSubmitting}
                            searchable
                            clearable
                        />

                        <TextInputField
                            label="Description"
                            placeholder="Enter exam description"
                            textarea
                            rows={4}
                            required
                            {...register("description")}
                            error={errors.description?.message}
                            disabled={isSubmitting}
                        />

                        <TextInputField
                            icon={Clock}
                            label="Exam Duration (Minutes)"
                            placeholder="Enter duration in minutes"
                            type="number"
                            min="1"
                            max="999"
                            required
                            {...register("duration", { valueAsNumber: true })}
                            error={errors.duration?.message}
                            disabled={isSubmitting}
                        />

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <TextInputField
                                label="Points per Question"
                                placeholder="Enter points for correct answer"
                                type="number"
                                step="0.01"
                                min="0"
                                max="99999.99"
                                required
                                {...register("points_per_question", { valueAsNumber: true })}
                                error={errors.points_per_question?.message}
                                disabled={isSubmitting}
                            />
                            {formData.is_negative_marking && (
                                <TextInputField
                                    label="Negative Marking Points"
                                    placeholder="Enter negative marking points"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="99999.99"
                                    required
                                    {...register("negative_marking_point", { valueAsNumber: true })}
                                    error={errors.negative_marking_point?.message}
                                    disabled={isSubmitting}
                                />
                            )}
                        </div>

                        <div className="space-y-3 pt-2">
                            <SwitchField
                                id="publish"
                                label="Publish Exam"
                                description="Make this exam visible to students"
                                checked={formData.publish}
                                onChange={(checked) => setValue("publish", checked)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="assign"
                                label="Assign Exam"
                                description="Assign this exam to students"
                                checked={formData.assign}
                                onChange={(checked) => setValue("assign", checked)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="live"
                                label="Live Exam"
                                description="Set exam as live and active"
                                checked={formData.live}
                                onChange={(checked) => setValue("live", checked)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="is_negative_marking"
                                label="Negative Marking"
                                description="Enable negative marking for wrong answers"
                                checked={formData.is_negative_marking}
                                onChange={(checked) => setValue("is_negative_marking", checked)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4 border-t">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClose}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={() => formHandleSubmit(handleSubmit)()}
                                disabled={isSubmitting}
                                className="w-full sm:w-auto min-w-30"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {mode === "update" ? "Updating..." : "Creating..."}
                                    </>
                                ) : (
                                    mode === "update" ? "Update Exam" : "Create Exam"
                                )}
                            </Button>
                        </div>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    )
})