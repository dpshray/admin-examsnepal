'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import {Button} from '@/components/ui/button'
import {Loader2} from 'lucide-react'
import {cn} from '@/lib/utils'

interface ActionModalProps {
    open: boolean
    setOpen: (open: boolean) => void
    title: string
    description: string
    confirmLabel?: string
    loading?: boolean
    confirmVariant?: 'default' | 'destructive' | 'outline' | 'secondary'
    onConfirm: () => void
    buttonClassName?: string
}

export default function ActionModal({
    open,
    setOpen,
    title,
    description,
    confirmLabel = 'Confirm',
    loading = false,
    confirmVariant = 'destructive',
    onConfirm,
    buttonClassName,
}: ActionModalProps) {
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-md max-w-[calc(100%-2rem)]">
                <DialogHeader>
                    <DialogTitle className="text-base sm:text-lg">{title}</DialogTitle>
                    <DialogDescription className="text-sm sm:text-base">{description}</DialogDescription>
                </DialogHeader>
                <DialogFooter className="flex-col sm:flex-row gap-4 sm:gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setOpen(false)}
                        disabled={loading}
                        className="w-full sm:w-auto order-2 sm:order-1 cursor-pointer"
                    >
                        Cancel
                    </Button>
                    <Button
                        variant={confirmVariant}
                        onClick={onConfirm}
                        disabled={loading}
                        className={cn(
                            'w-full sm:w-auto order-1 sm:order-2 flex items-center justify-center gap-2 ',
                            "cursor-pointer",
                            buttonClassName
                        )}
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true"/>}
                        {confirmLabel}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}