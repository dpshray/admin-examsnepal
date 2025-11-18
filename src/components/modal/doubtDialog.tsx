"use client";

import { useState, useEffect } from "react"
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

interface Option {
  id: number
  option: string
  value: number
}

interface ResolveDoubtDialogProps {
  doubt: any | null
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
  const [question, setQuestion] = useState("")
  const [options, setOptions] = useState<Option[]>([])
  const [explanation, setExplanation] = useState("")
  const [remark, setRemark] = useState("")

  useEffect(() => {
    if (doubt) {
      setQuestion(doubt.question?.question || "")
      setOptions(doubt.question?.options || [])
      setExplanation(doubt.question?.explanation || "")
      setRemark(doubt.remark || "")
    }
  }, [doubt])

  const handleOptionChange = (id: number, field: "option" | "value", value: any) => {
    setOptions((prev) =>
      prev.map((opt) =>
        opt.id === id
          ? { ...opt, [field]: field === "value" ? Number(value) : value }
          : opt
      )
    )
  }

  const handleAddOption = () => {
    const newOption: Option = {
      id: Date.now(),
      option: "",
      value: 0,
    }
    setOptions((prev) => [...prev, newOption])
  }

  const handleRemoveOption = (id: number) => {
    setOptions((prev) => prev.filter((opt) => opt.id !== id))
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!doubt) return toast.error("No doubt selected")

    if (!question.trim()) {
      toast.error("Question cannot be empty.")
      return
    }

    if (!explanation.trim()) {
      toast.error("Explanation cannot be empty.")
      return
    }

    if (!remark.trim()) {
      toast.error("Remark is required.")
      return
    }

    if (options.length === 0 || !options.some((opt) => opt.value === 1)) {
      toast.error("At least one option must be correct.")
      return
    }

    setLoading(true)
    try {
      await doubtService.resolveDoubt(doubt.id, {
        question: question.trim(),
        options,
        explanation: explanation.trim(),
        remark: remark.trim(),
        selected_id: doubt.id,
      })

      toast.success("Doubt updated successfully!")
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error("Failed to update doubt. Try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {doubt?.status === "Resolved" ? "Edit Doubt" : "Resolve Doubt"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Question */}
          <TextInputField
            label="Question"
            textarea
            value={question}
            onChange={(e: any) => setQuestion(e.target.value)}
            required
          />

          {/* Options */}
          <div className="flex flex-col gap-2">
            <label className="font-medium text-gray-700">Options</label>
            {options.map((opt, index) => (
              <div key={opt.id} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={opt.value === 1}
                  onChange={() =>
                    setOptions((prev) =>
                      prev.map((o) => ({ ...o, value: o.id === opt.id ? 1 : 0 }))
                    )
                  }
                  className="accent-green-600"
                />
                <input
                  type="text"
                  value={opt.option}
                  onChange={(e) => handleOptionChange(opt.id, "option", e.target.value)}
                  placeholder={`Option ${index + 1}`}
                  className="flex-1 border rounded px-2 py-1"
                  required
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleRemoveOption(opt.id)}
                  size="sm"
                >
                  Remove
                </Button>
              </div>
            ))}
            <Button type="button" variant="ghost" onClick={handleAddOption} className="mt-2">
              + Add Option
            </Button>
          </div>

          {/* Explanation */}
          <TextInputField
            label="Explanation"
            textarea
            value={explanation}
            onChange={(e: any) => setExplanation(e.target.value)}
            required
          />

          {/* Remark */}
          <TextInputField
            label="Remark"
            textarea
            value={remark}
            onChange={(e: any) => setRemark(e.target.value)}
            required
          />

          {/* Actions */}
          <div className="mt-4 flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
