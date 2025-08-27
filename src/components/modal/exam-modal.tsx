"use client"

import React, {useEffect, useState} from "react"
import {Dialog, DialogContent, DialogHeader, DialogTitle} from "@/components/ui/dialog"
import {Button} from "@/components/ui/button"
import {Label} from "@/components/ui/label"
import {Switch} from "@/components/ui/switch"
import {examService} from "@/service/exam.service"
import SelectInputField from "@/components/field/SelectInputField"
import {useForm} from "react-hook-form"
import * as Yup from "yup"
import {yupResolver} from "@hookform/resolvers/yup"
import TextInputField from "@/components/field/TextInputField"
import {toast} from "sonner";

interface ExamFormData {
    exam_type_id: number
    category_type: number
    exam_name: string
    description: string
    publish: boolean
    assign: boolean
    live: boolean
}

interface ExamModalProps {
    isOpen: boolean
    onClose: () => void
    mode?: "create" | "update"
    initialData?: Partial<ExamFormData> & { id?: number } | null
    onSuccess?: () => void
}

const examSchema = Yup.object().shape({
    exam_type_id: Yup.number().required("Exam type is required"),
    category_type: Yup.number().required("Category type is required"),
    exam_name: Yup.string().required("Exam name is required"),
    description: Yup.string().required("Description is required"),
    publish: Yup.boolean().required("Publish is required"),
    assign: Yup.boolean().required("Assign is required"),
    live: Yup.boolean().required("Live is required"),
})

export function ExamModal({isOpen, onClose, mode = "create", initialData, onSuccess}: ExamModalProps) {
    const [examTypes, setExamTypes] = useState<{ id: number; name: string }[]>([])
    const [categoryTypes, setCategoryTypes] = useState<{ id: number; name: string }[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const {
        register,
        handleSubmit: formHandleSubmit,
        formState: {errors},
        setValue,
        watch,
    } = useForm<ExamFormData>({
        resolver: yupResolver(examSchema),
        defaultValues: {
            exam_type_id: 1,
            category_type: 1,
            exam_name: "",
            description: "",
            publish: true,
            assign: true,
            live: true
        },
    })

    const formData = watch()

    const handleSubmit = async (data: ExamFormData) => {
        setIsSubmitting(true)
        setError(null)
        try {
            const payload = {
                ...data,
                publish: data.publish ? 1 : 0,
                assign: data.assign ? 1 : 0,
                live: data.live ? 1 : 0,
            }
            let response
                if (mode === "update" && initialData?.id) {
                response = await examService.updateExam(initialData.id, payload)
                toast.success(response?.message || "Exam updated successfully")
                } else {
                response = await examService.createExam(payload)
                toast.success(response?.message || "Exam created successfully")
            }
            if (onSuccess) onSuccess()
            onClose()
        } catch (error: any) {
            setError( error?.message || "Failed to create exam. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (mode === "update" && initialData) {
            setValue("exam_type_id", initialData.exam_type_id || 1)
            setValue("category_type", initialData.category_type || 1)
            setValue("exam_name", initialData.exam_name || "")
            setValue("description", initialData.description || "")
            setValue("publish", Boolean(initialData.publish))
            setValue("assign", Boolean(initialData.assign))
            setValue("live", Boolean(initialData.live))
        }
    }, [mode, initialData, setValue])
    
    console.log("Initial Data:", initialData);

    useEffect(() => {
    if (!isOpen) return
    setLoading(true)
    setError(null)

    const fetchData = async () => {
        try {
            const [examTypesRes, categoryTypesRes] = await Promise.all([
                examService.getExamType(),
                examService.examCategory()
            ])

            setExamTypes(examTypesRes)
            setCategoryTypes(categoryTypesRes)

            if (mode === "create") {
                if (examTypesRes.length > 0) setValue("exam_type_id", examTypesRes[0].id)
                if (categoryTypesRes.length > 0) setValue("category_type", categoryTypesRes[0].id)
            } else if (mode === "update" && initialData) {
                setValue("exam_type_id", initialData.exam_type_id || 1)
                setValue("category_type", initialData.category_type || 1)
                setValue("exam_name", initialData.exam_name || "")
                setValue("description", initialData.description || "")
                setValue("publish", Boolean(initialData.publish))
                setValue("assign", Boolean(initialData.assign))
                setValue("live", Boolean(initialData.live))
            }
        } catch {
            setError("Failed to load exam/category types.")
        } finally {
            setLoading(false)
        }
    }

    fetchData()
}, [isOpen, mode, initialData, setValue])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>{mode === "update" ? "Update Exam" : "Create New Exam"}</DialogTitle>
                </DialogHeader>
                {loading && (
                    <div className="mb-4 text-center text-sm text-gray-500">Loading...</div>
                )}
                {error && (
                    <div className="mb-4 text-center text-sm text-red-600">{error}</div>
                )}
                <form onSubmit={formHandleSubmit(handleSubmit)} className="space-y-4">
                    <div className="space-y-2">
                        <TextInputField
                            label="Exam Name"
                            placeholder="Enter Exam Name"
                            {...register("exam_name")}
                            error={errors.exam_name?.message}
                            value={formData.exam_name}
                            disabled={loading || isSubmitting}
                        />
                    </div>
                    <div className="grid gap-4">
                        <div className="space-y-2 max-w-[380px]">
                            <SelectInputField
                                label="Exam Type"
                                placeholder="Select Exam Type"
                                options={examTypes.map(({id, name}) => ({label: name, value: id.toString()}))}
                                value={formData.exam_type_id.toString()}
                                onChange={(value) => setValue("exam_type_id", Number(value))}
                                disabled={loading || isSubmitting}
                            />
                        </div>
                        <div className="space-y-2 max-w-[380px]">
                            <SelectInputField
                                label="Category Type"
                                placeholder="Select Category"
                                options={categoryTypes.map(({id, name}) => ({label: name, value: id.toString()}))}
                                value={formData.category_type.toString()}
                                onChange={(value) => setValue("category_type", Number(value))}
                                disabled={loading || isSubmitting}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="description">Description</Label>
                        <TextInputField
                            textarea
                            placeholder="Enter Description"
                            {...register("description")}
                            error={errors.description?.message}
                            value={formData.description}
                            disabled={loading || isSubmitting}
                        />
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="publish"
                            checked={formData.publish}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            onCheckedChange={(checked) => setValue("publish", checked)}
                            disabled={loading || isSubmitting}
                        />
                        <Label htmlFor="publish">Publish exam</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="assign"
                            checked={formData.assign}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            onCheckedChange={(checked) => setValue("assign", checked)}
                            disabled={loading || isSubmitting}
                        />
                        <Label htmlFor="assign">Assign exam</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <Switch
                            id="live"
                            checked={formData.live}
                            className="data-[state=checked]:bg-green-500 data-[state=checked]:border-green-500"
                            onCheckedChange={(checked) => setValue("live", checked)}
                            disabled={loading || isSubmitting}
                        />
                        <Label htmlFor="live">Live exam</Label>
                    </div>
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || loading}>
                            {isSubmitting ? (mode === "update" ? "Updating..." : "Creating...") 
                                : (mode === "update" ? "Update Exam" : "Create Exam")}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
