"use client"

import { useEffect, useMemo, useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Send } from "lucide-react"

interface WhatsAppMessageDialogProps {
    student: {
        name: string
        phone: string | null
    } | null
    isOpen: boolean
    onClose: () => void
}

/**
 * Normalises a student's phone number to the international digits-only format
 * wa.me expects. Local Nepali mobiles (98XXXXXXXX / 97XXXXXXXX) get the 977
 * country code prepended. Returns null when the number can't be used.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
    if (!phone) return null
    let digits = phone.replace(/\D/g, "")
    if (digits.startsWith("00")) digits = digits.slice(2)
    digits = digits.replace(/^0+/, "")
    if (digits.length === 10 && digits.startsWith("9")) digits = `977${digits}`
    return digits.length >= 10 && digits.length <= 15 ? digits : null
}

export default function WhatsAppMessageDialog({ student, isOpen, onClose }: WhatsAppMessageDialogProps) {
    const [message, setMessage] = useState("")

    useEffect(() => {
        if (isOpen && student) {
            const firstName = student.name?.trim().split(/\s+/)[0] ?? ""
            setMessage(firstName ? `Hi ${firstName},\n\n` : "")
        }
    }, [isOpen, student])

    const waNumber = useMemo(() => toWhatsAppNumber(student?.phone), [student])

    const handleSend = () => {
        if (!waNumber || !message.trim()) return
        const url = `https://wa.me/${waNumber}?text=${encodeURIComponent(message.trim())}`
        window.open(url, "_blank", "noopener,noreferrer")
        onClose()
    }

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg">
                <DialogHeader>
                    <DialogTitle>Send WhatsApp message</DialogTitle>
                    <DialogDescription>
                        To {student?.name}
                        {student?.phone ? ` · ${student.phone}` : ""}
                    </DialogDescription>
                </DialogHeader>

                {!waNumber ? (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>
                            This student doesn&apos;t have a valid phone number on file.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <div className="space-y-2">
                        <Textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            rows={6}
                            placeholder="Type your message..."
                            autoFocus
                        />
                        <p className="text-xs text-muted-foreground">
                            Opens WhatsApp with this message pre-filled for +{waNumber}. You send it from
                            your own WhatsApp account.
                        </p>
                    </div>
                )}

                <DialogFooter>
                    <Button variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSend}
                        disabled={!waNumber || !message.trim()}
                        className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white"
                    >
                        <Send className="h-4 w-4" />
                        Open WhatsApp
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
