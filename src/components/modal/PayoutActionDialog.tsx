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
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Loader2 } from "lucide-react";

interface PayoutActionDialogProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    description: string;
    confirmLabel: string;
    loading?: boolean;
    onConfirm: (remark: string) => void;
}

export default function PayoutActionDialog({
    open,
    setOpen,
    title,
    description,
    confirmLabel,
    loading = false,
    onConfirm,
}: PayoutActionDialogProps) {
    const [remark, setRemark] = useState("");

    return (
        <Dialog
            open={open}
            onOpenChange={(value) => {
                setOpen(value);
                if (!value) setRemark("");
            }}
        >
            <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">{description}</DialogDescription>
                </DialogHeader>

                <div className="space-y-2">
                    <Label htmlFor="payout-remark">Remark (optional)</Label>
                    <Textarea
                        id="payout-remark"
                        value={remark}
                        onChange={(e) => setRemark(e.target.value)}
                        placeholder="Visible to the teacher - e.g. payment reference or note"
                        disabled={loading}
                    />
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-4 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={() => onConfirm(remark)}
                        disabled={loading}
                        className="w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
