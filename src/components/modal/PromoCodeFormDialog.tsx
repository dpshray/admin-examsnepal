"use client";

import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Tag, Pencil, Loader2 } from "lucide-react";
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
import {
  useAddPromoCode,
  useUpdatePromoCode,
} from "@/hooks/use-payment-settings";

const promoCodeSchema = z.object({
  code: z.string().min(1, "Code is required").max(50),
  discount_percent: z
    .string()
    .min(1, "Discount percent is required")
    .refine((val) => {
      const num = Number(val);
      return !isNaN(num) && num > 0 && num <= 100;
    }, "Discount must be a number between 0 and 100"),
  detail: z.string().min(1, "Detail is required").max(255),
  status: z.boolean(),
});

type PromoCodeFormValues = z.infer<typeof promoCodeSchema>;

interface PromoCodeData {
  id: number;
  code: string;
  discount_percent: string;
  detail: string;
  status: number;
}

interface PromoCodeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  promoCode?: PromoCodeData | null;
}

export default function PromoCodeFormDialog({
  open,
  onOpenChange,
  promoCode,
}: PromoCodeFormDialogProps) {
  const isEditing = !!promoCode;
  const { mutateAsync: addPromoCode, isPending: addPending } =
    useAddPromoCode();
  const { mutateAsync: updatePromoCode, isPending: updatePending } =
    useUpdatePromoCode();
  const isPending = addPending || updatePending;

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm<PromoCodeFormValues>({
    resolver: zodResolver(promoCodeSchema),
    defaultValues: {
      code: "",
      discount_percent: "",
      detail: "",
      status: true,
    },
  });

  useEffect(() => {
    if (open) {
      reset(
        promoCode
          ? {
              code: promoCode.code,
              discount_percent: promoCode.discount_percent,
              detail: promoCode.detail,
              status: Boolean(promoCode.status),
            }
          : { code: "", discount_percent: "", detail: "", status: true },
      );
    }
  }, [open, promoCode, reset]);

  const onSubmit = async (values: PromoCodeFormValues) => {
    const payload = {
      code: values.code,
      discount_percent: values.discount_percent,
      detail: values.detail,
      status: values.status ? 1 : 0,
    };

    if (isEditing) {
      await updatePromoCode(
        { id: String(promoCode!.id), data: payload },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      await addPromoCode(payload, { onSuccess: () => onOpenChange(false) });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[95vh] max-w-md overflow-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Pencil className="h-5 w-5 text-blue-500" /> Edit Promo Code
              </>
            ) : (
              <>
                <Tag className="h-5 w-5 text-green-500" /> Add Promo Code
              </>
            )}
          </DialogTitle>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="space-y-4"
        >
          <TextInputField
            label="Code"
            placeholder="e.g. DASHAIN-2081"
            required
            error={errors.code?.message}
            {...register("code")}
          />

          <TextInputField
            label="Discount Percent"
            placeholder="e.g. 10"
            type="number"
            required
            error={errors.discount_percent?.message}
            {...register("discount_percent")}
          />

          <TextInputField
            label="Detail"
            placeholder="e.g. Dashain Festival Offer"
            required
            error={errors.detail?.message}
            {...register("detail")}
          />

          <div className="flex items-center justify-between rounded-md border px-3 py-2">
            <Label htmlFor="status" className="text-sm font-medium">
              Active
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
                  {isEditing ? "Saving..." : "Adding..."}
                </>
              ) : isEditing ? (
                "Save Changes"
              ) : (
                "Add Promo Code"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
