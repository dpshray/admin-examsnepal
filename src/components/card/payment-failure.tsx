import { Card, CardContent } from "@/components/ui/card";
import { XCircle } from "lucide-react";

export default function PaymentFailureCard() {
    return (
        <div className="h-screen bg-gradient-to-br from-red-50 to-pink-50 flex items-center justify-center p-4">
            <Card className="w-full max-w-md mx-auto shadow-xl rounded-2xl">
                <CardContent className="p-8 text-center space-y-6">
                    <div className="flex justify-center">
                        <div className="relative">
                            <XCircle
                                className="w-16 h-16 text-red-500 animate-bounce"
                                aria-hidden="true"
                            />
                            <div className="absolute inset-0 w-16 h-16 bg-red-500/20 rounded-full animate-ping" />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">Payment Failed</h1>
                        <p className="text-gray-600">
                            Oops! Something went wrong while processing your payment.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}