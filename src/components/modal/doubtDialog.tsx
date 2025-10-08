"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import TextInputField from "../field/TextInputField"
import { toast } from "sonner"
import { doubtService } from "@/service/doubt.service"

interface ResolveDoubtDialogProps {
    doubt: {
        id: number
        title?: string
    } | null
    isOpen: boolean
    onClose: () => void
    onSuccess: () => void
}

export default function ResolveDoubtDialog({
    doubt,
    isOpen,
    onClose,
    onSuccess,
}: ResolveDoubtDialogProps) {
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault()
        if (!doubt) return toast.error("No doubt selected")

        const formData = new FormData(e.currentTarget)
        const remark = formData.get("remark")?.toString().trim()

        if (!remark) {
            toast.error("Please enter a remark.")
            return
        }

        setLoading(true)
        try {
            await doubtService.resolveDoubt(doubt.id, { remark, selected_id: doubt.id })
            toast.success("Doubt resolved successfully!")
            onSuccess()
            onClose()
        } catch (err) {
            console.error(err)
            toast.error("Failed to resolve doubt. Please try again.")
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle>
                        Resolve Doubt {doubt?.title ? `- ${doubt.title}` : ""}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-3">
                    <TextInputField
                        name="remark"
                        label="Remark"
                        textarea
                        placeholder="Enter your resolution remark"
                        required
                    />

                <div className="mt-4 flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="submit" disabled={loading}>
                        {loading ? "Submitting..." : "Submit"}
                    </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
