"use client"

import {memo, useCallback, useEffect, useMemo} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {Alert, AlertDescription} from "@/components/ui/alert"
import SelectInputField from "@/components/field/SelectInputField"
import TextInputField from "@/components/field/TextInputField"
import {useForm} from "react-hook-form"
import {yupResolver} from "@hookform/resolvers/yup"
import * as yup from "yup"
import {toast} from "sonner"
import {AlertCircle, Loader2} from "lucide-react"
import {useExamTypes} from "@/hooks/useExamTypes"
import {useExamCategories} from "@/hooks/useExamCategories"
import {examService} from "@/service/exam.service"

interface ExamFormData {
    exam_type_id: number
    category_type: number
    exam_name: string
    description: string
    publish: number
    assign: number
    live: number
    is_negative_marking: number
    negative_marking_point: number
    points_per_question: number
}

interface ExamModalProps {
    isOpen: boolean
    onClose: () => void
    mode?: "create" | "update"
    initialData?: Partial<ExamFormData> & { id?: number } | null
    onSuccessAction?: () => void
}

const examSchema = yup.object({
    exam_type_id: yup.number().required("Exam type is required"),
    category_type: yup.number().required("Category is required"),
    exam_name: yup.string().required("Exam name is required"),
    description: yup.string().required("Description is required"),
    publish: yup.number().oneOf([0, 1], "Invalid value").required(),
    assign: yup.number().oneOf([0, 1], "Invalid value").required(),
    live: yup.number().oneOf([0, 1], "Invalid value").required(),
    is_negative_marking: yup.number().oneOf([0, 1], "Invalid value").required(),
    negative_marking_point: yup
        .number()
        .min(0, "Must be 0 or more")
        .required("Negative marking point is required"),
    points_per_question: yup
        .number()
        .min(0, "Must be 0 or more")
        .required("Points per question is required"),
})

const SwitchField = memo(
    ({
         id,
         label,
         description,
         checked,
         onChange,
         disabled,
     }: {
        id: string
        label: string
        description: string
        checked: boolean
        onChange: (checked: boolean) => void
        disabled: boolean
    }) => (
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/50">
            <div className="space-y-0.5 flex-1 pr-2">
                <Label htmlFor={id} className="text-sm font-medium cursor-pointer">
                    {label}
                </Label>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <Switch id={id} checked={checked} onCheckedChange={onChange} disabled={disabled} aria-label={label}/>
        </div>
    )
)

SwitchField.displayName = "SwitchField"

export const ExamModalForm = memo(function ExamModalForm({
                                                             isOpen,
                                                             onClose,
                                                             mode = "create",
                                                             initialData,
                                                             onSuccessAction,
                                                         }: ExamModalProps) {
    const {data: examTypesData, isLoading: examTypesLoading, error: examTypesError} = useExamTypes()
    const {data: examCategories, isLoading: categoriesLoading, error: categoriesError} = useExamCategories()

    const {
        register,
        handleSubmit: formHandleSubmit,
        formState: {errors, isSubmitting},
        setValue,
        watch,
        reset,
    } = useForm<ExamFormData>({
        resolver: yupResolver(examSchema),
        defaultValues: {
            exam_type_id: 0,
            category_type: 0,
            exam_name: "",
            description: "",
            publish: 1,
            assign: 1,
            live: 1,
            is_negative_marking: 0,
            negative_marking_point: 0,
            points_per_question: 0,
        },
    })

    const formData = watch()

    const examTypeOptions = useMemo(() => {
        if (!examTypesData?.length) return []
        return examTypesData.map((type: any) => ({label: type.name, value: type.id}))
    }, [examTypesData])

    const categoryTypeOptions = useMemo(() => {
        if (!examCategories?.length) return []
        return examCategories.map((category: any) => ({label: category.name, value: category.id}))
    }, [examCategories])

    const handleClose = useCallback(() => {
        reset()
        onClose()
    }, [onClose, reset])

    const handleSubmit = useCallback(
        async (data: ExamFormData) => {
            try {
                let response
                if (mode === "update" && initialData?.id) {
                    response = await examService.updateExam(initialData.id, data)
                    toast.success(response?.message || "Exam updated successfully")
                } else {
                    response = await examService.createExam(data)
                    toast.success(response?.message || "Exam created successfully")
                }
                onSuccessAction?.()
                handleClose()
            } catch (error: any) {
                const errorMessage = error?.response?.data?.message || error?.message || "Operation failed. Please try again."
                toast.error(errorMessage)
            }
        },
        [mode, initialData?.id, onSuccessAction, handleClose]
    )

    useEffect(() => {
        if (!isOpen) return
        if (mode === "create") {
            if (examTypesData?.length > 0) setValue("exam_type_id", examTypesData[0].id)
            if (examCategories?.length > 0) setValue("category_type", examCategories[0].id)
        } else if (mode === "update" && initialData) {
            ;[
                "exam_type_id",
                "category_type",
                "exam_name",
                "description",
                "publish",
                "assign",
                "live",
                "is_negative_marking",
                "negative_marking_point",
                "points_per_question",
            ].forEach((field) => {
                const value = initialData[field as keyof ExamFormData]
                if (value !== undefined) setValue(field as keyof ExamFormData, value)
            })
        }
    }, [isOpen, mode, initialData, examTypesData, examCategories, setValue])

    const isLoading = examTypesLoading || categoriesLoading
    const hasError = !!(examTypesError || categoriesError)

    return (
        <Dialog open={isOpen} onOpenChange={handleClose}>
            <DialogContent className="w-[95vw] max-w-125 max-h-[90vh] overflow-y-auto p-4 sm:p-6">
                <DialogHeader>
                    <DialogTitle className="text-lg sm:text-xl font-semibold">
                        {mode === "update" ? "Update Exam" : "Create New Exam"}
                    </DialogTitle>
                </DialogHeader>

                {isLoading && (
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="w-6 h-6 animate-spin text-primary"/>
                        <span className="ml-2 text-sm text-muted-foreground">Loading...</span>
                    </div>
                )}

                {hasError && (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4"/>
                        <AlertDescription>Failed to load form data. Please try again.</AlertDescription>
                    </Alert>
                )}

                {!isLoading && !hasError && (
                    <form onSubmit={formHandleSubmit(handleSubmit)} className="space-y-4">
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
                                options={categoryTypeOptions}
                                value={formData.category_type}
                                onChangeAction={(value) => setValue("category_type", Number(value))}
                                disabled={isSubmitting}
                                required
                                error={errors.category_type?.message}
                            />
                        </div>

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

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                            <TextInputField
                                label="Points per Question"
                                placeholder="Enter correct marking points"
                                type="number"
                                step="0.01"
                                min="0"
                                max="99999.99"
                                required
                                {...register("points_per_question", {valueAsNumber: true})}
                                error={errors.points_per_question?.message}
                                disabled={isSubmitting}
                            />
                            {formData.is_negative_marking === 1 && (
                                <TextInputField
                                    label="Negative Marking Points"
                                    placeholder="Enter negative marking points"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    max="99999.99"
                                    required
                                    {...register("negative_marking_point", {valueAsNumber: true})}
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
                                checked={formData.publish === 1}
                                onChange={(checked) => setValue("publish", checked ? 1 : 0)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="assign"
                                label="Assign Exam"
                                description="Assign this exam to students"
                                checked={formData.assign === 1}
                                onChange={(checked) => setValue("assign", checked ? 1 : 0)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="live"
                                label="Live Exam"
                                description="Set exam as live/active"
                                checked={formData.live === 1}
                                onChange={(checked) => setValue("live", checked ? 1 : 0)}
                                disabled={isSubmitting}
                            />
                            <SwitchField
                                id="is_negative_marking"
                                label="Negative Marking"
                                description="Enable negative marking for wrong answers"
                                checked={formData.is_negative_marking === 1}
                                onChange={(checked) => setValue("is_negative_marking", checked ? 1 : 0)}
                                disabled={isSubmitting}
                            />
                        </div>

                        <div className="flex flex-col-reverse sm:flex-row justify-end gap-2 sm:gap-3 pt-4">
                            <Button type="button" variant="outline" onClick={handleClose} disabled={isSubmitting}
                                    className="w-full sm:w-auto">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                                {isSubmitting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin"/>
                                        {mode === "update" ? "Updating..." : "Creating..."}
                                    </>
                                ) : mode === "update" ? (
                                    "Update Exam"
                                ) : (
                                    "Create Exam"
                                )}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    )
})
