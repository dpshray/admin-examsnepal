"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { studentService } from "@/service/student.service"
import TextInputField from "../field/TextInputField"

interface SubscriptionDialogProps {
  student: {
    name: string
    email: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
}

export default function SubscriptionDialog({
  student,
  isOpen,
  onClose,
  onSuccess,
}: SubscriptionDialogProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!student) return

    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const payload = {
      start_date: formData.get("start_date"),
      end_date: formData.get("end_date"),
      remark: formData.get("remark"),
    }

    try {
      await studentService.subscribeStudent(student.email as string, payload as { start_date: string; end_date: string; remark?: string })
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      setError("Failed to subscribe student. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
            <DialogHeader>
                <DialogTitle>
                    Subscribe {student?.name ?? "Student"}
                </DialogTitle>
            </DialogHeader>

            {error && <p className="text-red-500 text-sm mb-2">{error}</p>}

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
                <TextInputField
                    name="start_date"
                    label="Start Date"
                    type="date"
                    required
                    className="w-full p-2"
                />
                <TextInputField
                    name="end_date"
                    label="End Date"
                    type="date"
                    required
                    className="w-full p-2"
                />
                <TextInputField
                    name="remark"
                    label="Remark"
                    required
                    className="w-full p-2"
                    textarea
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
