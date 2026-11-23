"use client";

import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";
import TextInputField from "../field/TextInputField";
import SelectInputField from "../field/SelectInputField";
import { useExamTypes } from "@/hooks/useExamTypes";
import { SendNotificationPayload } from "@/service/notification.service";

const schema = z.object({
  title: z.string().min(1, "Title is required").max(255),
  body: z.string().min(1, "Description is required").max(1000),
  exam_type_id: z.string().min(1, "Exam type is required"),
  send_and_store: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

interface NotificationFormModalProps {
  open: boolean;
  onCloseAction: () => void;
  onSubmitAction: (data: SendNotificationPayload) => Promise<void> | void;
  isLoading?: boolean;
}

export function NotificationFormModal({
  open,
  onCloseAction,
  onSubmitAction,
  isLoading = false,
}: NotificationFormModalProps) {
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: "",
      body: "",
      exam_type_id: "",
      send_and_store: false,
    },
  });

  const { data: examTypesData, isLoading: isLoadingExamTypes } = useExamTypes();

  const examTypeOptions = React.useMemo(() => {
    const list: any[] =
      (examTypesData as any)?.data?.data?.data ??
      (examTypesData as any)?.data?.data ??
      (examTypesData as any)?.data ??
      [];
    return (Array.isArray(list) ? list : []).map((t) => ({
      value: String(t.id),
      label: t.name,
    }));
  }, [examTypesData]);

  React.useEffect(() => {
    if (open) {
      reset({ title: "", body: "", exam_type_id: "", send_and_store: false });
    }
  }, [open, reset]);

  const handleFormSubmit = async (values: FormValues) => {
    await onSubmitAction({
      title: values.title,
      body: values.body,
      exam_type_id: Number(values.exam_type_id),
      send_and_store: values.send_and_store,
    });
  };

  const handleDialogChange = (value: boolean) => {
    if (!value && !isSubmitting && !isLoading) {
      reset();
      onCloseAction();
    }
  };

  const disabled = isSubmitting || isLoading;

  return (
    <Dialog open={open} onOpenChange={handleDialogChange}>
      <DialogContent className="flex max-h-[90vh] flex-col overflow-y-auto sm:max-w-[95vw] md:max-w-140">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold sm:text-xl">
            Send Notification
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
          <TextInputField
            {...register("title")}
            label="Title"
            placeholder="Enter notification title"
            error={errors.title?.message}
            disabled={disabled}
            required
          />

          <TextInputField
            {...register("body")}
            label="Description"
            placeholder="Enter notification message"
            error={errors.body?.message}
            disabled={disabled}
            textarea
            required
          />

          <SelectInputField
            label="Exam Type"
            placeholder="Select exam type"
            name="exam_type_id"
            options={examTypeOptions}
            value={watch("exam_type_id")}
            onChangeAction={(val) =>
              setValue("exam_type_id", String(val), { shouldValidate: true })
            }
            error={errors.exam_type_id?.message}
            disabled={disabled || isLoadingExamTypes}
            showAll={false}
            required
          />

          <div className="flex items-center gap-2">
            <Checkbox
              id="send_and_store"
              checked={watch("send_and_store")}
              onCheckedChange={(checked) =>
                setValue("send_and_store", checked === true)
              }
              disabled={disabled}
            />
            <Label htmlFor="send_and_store" className="cursor-pointer text-sm">
              Also store in notification history
            </Label>
          </div>

          <DialogFooter className="flex flex-col-reverse gap-3 border-t pt-4 sm:flex-row">
            <Button
              type="button"
              variant="outline"
              onClick={() => handleDialogChange(false)}
              disabled={disabled}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={disabled}>
              {disabled ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Send Notification"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
