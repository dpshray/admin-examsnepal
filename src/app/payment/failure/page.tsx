"use client"

import { ArrowLeft, HelpCircle, RefreshCw, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import PaymentFailureCard from "@/components/card/payment-failure"

export default function PaymentFailurePage() {
    const handleRetryPayment = () => {
        // Redirect to payment page or retry logic
        window.location.href = "/payment"
    }

    return (
        // <div className="min-h-screen bg-gradient-to-br from-red-50 to-rose-50 flex items-center justify-center p-4">
        //     <Card className="w-full max-w-md shadow-lg border-0">
        //         <CardHeader className="text-center pb-4">
        //             <div className="mx-auto mb-4 w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
        //                 <XCircle className="w-8 h-8 text-red-600"/>
        //             </div>
        //             <CardTitle className="text-2xl font-bold text-gray-900">Payment Failed</CardTitle>
        //             <p className="text-gray-600 mt-2">We couldn&#39;t process your payment</p>
        //         </CardHeader>

        //         <CardContent className="space-y-6">
        //             {/* Error Details */}
        //             <Alert className="border-red-200 bg-red-50">
        //                 <AlertDescription className="text-red-800">
        //                     <strong>Error:</strong> Your card was declined. Please check your payment details and try
        //                     again.
        //                 </AlertDescription>
        //             </Alert>

        //             {/* Transaction Details */}
        //             <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Transaction ID</span>
        //                     <span className="text-sm font-mono text-gray-900">#TXN-2024-002</span>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Amount</span>
        //                     <span className="text-lg font-semibold text-gray-900">$29.99</span>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Status</span>
        //                     <Badge variant="destructive" className="bg-red-100 text-red-800 hover:bg-red-100">
        //                         Failed
        //                     </Badge>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Date</span>
        //                     <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
        //                 </div>
        //             </div>

        //             {/* Common Issues */}
        //             <div className="space-y-3">
        //                 <h3 className="font-semibold text-gray-900">Common Issues:</h3>
        //                 <ul className="space-y-2 text-sm text-gray-600">
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        //                         Insufficient funds in your account
        //                     </li>
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        //                         Incorrect card details or expired card
        //                     </li>
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        //                         Bank security restrictions
        //                     </li>
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
        //                         Network connectivity issues
        //                     </li>
        //                 </ul>
        //             </div>

        //             {/* Action Buttons */}
        //             <div className="space-y-3">
        //                 <Button onClick={handleRetryPayment} className="w-full bg-red-600 hover:bg-red-700">
        //                     <RefreshCw className="w-4 h-4 mr-2"/>
        //                     Try Again
        //                 </Button>

        //                 <div className="flex gap-2">
        //                     <Button variant="outline" asChild className="flex-1 bg-transparent" size="sm">
        //                         <Link href="/" className="flex items-center justify-center gap-2">
        //                             <ArrowLeft className="w-4 h-4 mr-2"/>
        //                             Go Back
        //                         </Link>
        //                     </Button>
        //                     <Button variant="outline" className="flex-1 bg-transparent" size="sm">
        //                         <HelpCircle className="w-4 h-4 mr-2"/>
        //                         Help
        //                     </Button>
        //                 </div>
        //             </div>

        //             {/* Support Info */}
        //             <div className="text-center pt-4 border-t">
        //                 <p className="text-xs text-gray-500">
        //                     Need help? Contact our support team at{" "}
        //                     <a href="mailto:support@example.com" className="text-blue-600 hover:underline">
        //                         support@example.com
        //                     </a>
        //                 </p>
        //             </div>
        //         </CardContent>
        //     </Card>
        // </div>
        <PaymentFailureCard />
    )
}
