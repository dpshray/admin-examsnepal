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
}

interface ExamModalProps {
    isOpen: boolean
    onClose: () => void
}

const examSchema = Yup.object().shape({
    exam_type_id: Yup.number().required("Exam type is required"),
    category_type: Yup.number().required("Category type is required"),
    exam_name: Yup.string().required("Exam name is required"),
    description: Yup.string().required("Description is required"),
    publish: Yup.boolean().required("Publish is required"),
})

export function ExamModal({isOpen, onClose}: ExamModalProps) {
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
        },
    })

    const formData = watch()

    const handleSubmit = async (data: ExamFormData) => {
        setIsSubmitting(true)
        setError(null)
        try {
           const response = await examService.createExam(data)
            if (response) {
                console.log(' Response:', response)
                toast.success(response?.message || "Exam created successfully")
                onClose()
            }

        } catch (error: any) {
            setError( error?.message || "Failed to create exam. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    useEffect(() => {
        if (!isOpen) return
        setLoading(true)
        setError(null)

        const fetchExamTypes = async () => {
            try {
                const response = await examService.getExamType()
                console.log(response)
                setExamTypes(response)
                if (response.length > 0) setValue("exam_type_id", response[0].id)
            } catch {
                setError("Failed to load exam types.")
            }
        }
        const fetchCategoryTypes = async () => {
            try {
                const response = await examService.examCategory()
                setCategoryTypes(response)
                if (response.length > 0) setValue("category_type", response[0].id)
            } catch {
                setError((prev) => (prev ? prev + " Failed to load category types." : "Failed to load category types."))
            }
        }

        Promise.all([fetchExamTypes(), fetchCategoryTypes()]).finally(() => setLoading(false))
    }, [isOpen, setValue])

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create New Exam</DialogTitle>
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
                        <div className="space-y-2">
                            <SelectInputField
                                label="Exam Type"
                                placeholder="Select Exam Type"
                                options={examTypes.map(({id, name}) => ({label: name, value: id.toString()}))}
                                value={formData.exam_type_id.toString()}
                                onChange={(value) => setValue("exam_type_id", Number(value))}
                                disabled={loading || isSubmitting}
                            />
                        </div>
                        <div className="space-y-2">
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
                    <div className="flex justify-end space-x-2 pt-4">
                        <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting || loading}>
                            Cancel
                        </Button>
                        <Button type="submit" disabled={isSubmitting || loading}>
                            {isSubmitting ? "Creating..." : "Create Exam"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
