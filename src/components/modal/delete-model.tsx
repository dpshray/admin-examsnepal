"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface DeleteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => Promise<void>;
  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "destructive" | "warning";
  showIcon?: boolean;
  itemName?: string;
}

export function DeleteDialog({
                               open,
                               onOpenChange,
                               onConfirm,
                               title = "Delete Item",
                               description = "Are you sure you want to delete this item? This action cannot be undone.",
                               confirmText = "Delete",
                               cancelText = "Cancel",
                               variant = "destructive",
                               showIcon = true,
                               itemName,
                             }: DeleteDialogProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);
      await onConfirm();
      onOpenChange(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete. Please try again.");
      console.error("Delete failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (!loading) {
      setError(null);
      onOpenChange(false);
    }
  };

  return (
      <Dialog open={open} onOpenChange={handleCancel}>
        <DialogContent className="sm:max-w-[425px] gap-4">
          <DialogHeader className="space-y-3">
            {showIcon && (
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20">
                  <AlertTriangle className="h-6 w-6 text-red-600 dark:text-red-500" />
                </div>
            )}
            <DialogTitle className="text-center sm:text-left text-lg sm:text-xl">
              {title}
            </DialogTitle>
            <DialogDescription className="text-center sm:text-left text-sm">
              {description}
              {itemName && (
                  <span className="block mt-2 font-semibold text-foreground break-words">
                {itemName}
              </span>
              )}
            </DialogDescription>
          </DialogHeader>

          {error && (
              <Alert variant="destructive" className="py-2">
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
          )}

          <DialogFooter className="gap-2 sm:gap-2 flex-col-reverse sm:flex-row">
            <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={loading}
                className="w-full sm:w-auto"
            >
              {cancelText}
            </Button>
            <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={loading}
                className="w-full sm:w-auto min-w-[100px]"
            >
              {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
              ) : (
                  confirmText
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
  );
}