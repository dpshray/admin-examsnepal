"use client"

import { useEffect, useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { studentService } from "@/service/student.service"
import TextInputField from "../field/TextInputField"
import { toast } from "sonner"
import SelectInputField from "../field/SelectInputField"

interface SubscriptionDialogProps {
  student: {
    id: number
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
  const [subscriptionTypes, setSubscriptionTypes] = useState<
    { value: number; label: string; price: number }[]
  >([]);
  const [selectedType, setSelectedType] = useState<number | undefined>();

  useEffect(() => {
    if (isOpen) {
      (async () => {
        try {
          const res = await studentService.subscriptionType(student?.id as number);
          const types = res?.data ?? [];

          // map to SelectInputField options
          const opts = types.map((t: any) => ({
            value: t.subscription_type_id,
            label: `${t.duration} month${t.duration > 1 ? "s" : ""} - Rs ${t.price}`,
            price: t.price,
          }));
          setSubscriptionTypes(opts);
        } catch (err) {
          console.error(err);
          toast.error("Failed to fetch subscription types.");
        }
      })();
    }
  }, [isOpen, student?.id]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!student) return
    if (!selectedType) {
      toast.error("Please select a subscription type");
      return;
    }


    setLoading(true)
    setError(null)
    const formData = new FormData(e.currentTarget)
    const payload = {
      remark: formData.get("remark"),
      subscription_type_id: selectedType,
    }

    try {
      await studentService.subscribeStudent(student.id as number, payload as { subscription_type_id: number; remark?: string })
      toast.success("Student subscribed successfully!")
      onSuccess()
      onClose()
    } catch (err) {
      console.error(err)
      setError("Failed to subscribe student. Please try again.")
      toast.error(error || "Failed to subscribe student. Please try again.")
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

            <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
              <SelectInputField
                label="Subscription Type"
                placeholder="Select subscription type"
                name="subscription_type"
                required
                options={subscriptionTypes}
                value={selectedType}
                onChange={(val) => setSelectedType(val as number)}
              />
              <TextInputField
                  name="remark"
                  label="Remark"
                  className="w-full p-2"
                  textarea
                  placeholder="Enter remark"
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
