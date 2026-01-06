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
  const [explanation, setExplanation] = useState("")
  const [remark, setRemark] = useState("")
  // const [options, setOptions] = useState([
  //   { key: "a", text: "", isTrue: 0 },
  //   { key: "b", text: "", isTrue: 0 },
  //   { key: "c", text: "", isTrue: 0 },
  //   { key: "d", text: "", isTrue: 0 },
  // ]);

  const [options, setOptions] = useState([
  { id: null, key: "a", text: "", isTrue: 0 },
  { id: null, key: "b", text: "", isTrue: 0 },
  { id: null, key: "c", text: "", isTrue: 0 },
  { id: null, key: "d", text: "", isTrue: 0 },
])


  useEffect(() => {
    if (!doubt) return;

    setQuestion(doubt.question?.question ?? "");
    setExplanation(doubt.question?.explanation ?? "");
    setRemark(doubt.remark ?? "");

    // Convert array to your modal state
    const arr = doubt.question?.options ?? [];

    // const mapped = [
    //   { key: "a", text: arr[0]?.option ?? "", isTrue: Number(arr[0]?.value ?? 0) },
    //   { key: "b", text: arr[1]?.option ?? "", isTrue: Number(arr[1]?.value ?? 0) },
    //   { key: "c", text: arr[2]?.option ?? "", isTrue: Number(arr[2]?.value ?? 0) },
    //   { key: "d", text: arr[3]?.option ?? "", isTrue: Number(arr[3]?.value ?? 0) },
    // ];

    const mapped = [
      {
        id: arr[0]?.id ?? null,
        key: "a",
        text: arr[0]?.option ?? "",
        isTrue: Number(arr[0]?.value ?? 0),
      },
      {
        id: arr[1]?.id ?? null,
        key: "b",
        text: arr[1]?.option ?? "",
        isTrue: Number(arr[1]?.value ?? 0),
      },
      {
        id: arr[2]?.id ?? null,
        key: "c",
        text: arr[2]?.option ?? "",
        isTrue: Number(arr[2]?.value ?? 0),
      },
      {
        id: arr[3]?.id ?? null,
        key: "d",
        text: arr[3]?.option ?? "",
        isTrue: Number(arr[3]?.value ?? 0),
      },
    ]

    setOptions(mapped);
  }, [doubt]);

  const handleOptionChange = (key: string, value: string) => {
    setOptions((prev) =>
      prev.map((opt) => (opt.key === key ? { ...opt, text: value } : opt))
    );
  };

  const handleCorrectChange = (key: string) => {
    setOptions((prev) =>
      prev.map((opt) => ({
        ...opt,
        isTrue: opt.key === key ? 1 : 0,
      }))
    );
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!doubt) return toast.error("No doubt selected")

    if (!question.trim()) return toast.error("Question cannot be empty.");
    if (!explanation.trim()) return toast.error("Explanation cannot be empty.");
    if (!remark.trim()) return toast.error("Remark is required.");

    if (!options.some((o) => o.isTrue === 1)) {
      return toast.error("Select one correct option.");
    }

    const payload = {
      question: question,
      explanation: explanation,
      remark: remark,
      selected_id: doubt.id,

      option_a_id: options[0].id,
      option_b_id: options[1].id,
      option_c_id: options[2].id,
      option_d_id: options[3].id,

      option_a: options[0].text,
      option_a_is_true: Boolean(options[0].isTrue),

      option_b: options[1].text,
      option_b_is_true: Boolean(options[1].isTrue),

      option_c: options[2].text,
      option_c_is_true: Boolean(options[2].isTrue),

      option_d: options[3].text,
      option_d_is_true: Boolean(options[3].isTrue),
    };
    setLoading(true)
    try {
      await doubtService.resolveDoubt(doubt.id, payload);
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
          <div className="flex flex-col gap-3">
            <label className="font-medium">Options</label>

            {options.map((opt) => (
              <div key={opt.key} className="flex items-center gap-2">
                <input
                  type="radio"
                  checked={opt.isTrue === 1}
                  onChange={() => handleCorrectChange(opt.key)}
                  className="accent-green-600"
                />

                <input
                  type="text"
                  value={opt.text}
                  onChange={(e) =>
                    handleOptionChange(opt.key, e.target.value)
                  }
                  placeholder={`Option ${opt.key.toUpperCase()}`}
                  className="flex-1 border px-2 py-1 rounded"
                  required
                />
              </div>
            ))}
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
