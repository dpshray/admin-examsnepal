"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Landmark, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import TextInputField from "@/components/field/TextInputField";
import { useUpdatePaymentSettings } from "@/hooks/use-payment-settings";

const paymentSettingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  status: z.boolean(),
});

type PaymentSettingFormValues = z.infer<typeof paymentSettingSchema>;

interface PaymentSettingFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PaymentSettingFormDialog({
  open,
  onOpenChange,
}: PaymentSettingFormDialogProps) {
  const { mutateAsync: updateSetting, isPending } = useUpdatePaymentSettings();

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PaymentSettingFormValues>({
    resolver: zodResolver(paymentSettingSchema),
    defaultValues: { name: "", status: true },
  });

  useEffect(() => {
    if (open) {
      reset({ name: "", status: true });
    }
  }, [open, reset]);

  const onSubmit = async (values: PaymentSettingFormValues) => {
    await updateSetting(values, { onSuccess: () => onOpenChange(false) });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-md overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5 text-green-500" /> Add Payment Method
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <TextInputField
            label="Name"
            placeholder="e.g. Esewa"
            required
            error={errors.name?.message}
            {...register("name")}
          />

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Enable this payment method
            </Label>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <Switch
                  id="status"
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              )}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Adding...
                </>
              ) : (
                "Add Payment Method"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
