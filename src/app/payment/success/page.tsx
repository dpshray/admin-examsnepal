// import { CheckCircle, ArrowRight, Download, Home } from "lucide-react"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
// import { Badge } from "@/components/ui/badge"
// import Link from "next/link"
import PaymentSuccessCard from "@/components/card/payment-success"

export default function PaymentSuccessPage() {
    return (
        // <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50 flex items-center justify-center p-4">
        //     <Card className="w-full max-w-md shadow-lg border-0">
        //         <CardHeader className="text-center pb-4">
        //             <div className="mx-auto mb-4 w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
        //                 <CheckCircle className="w-8 h-8 text-green-600" />
        //             </div>
        //             <CardTitle className="text-2xl font-bold text-gray-900">Payment Successful!</CardTitle>
        //             <p className="text-gray-600 mt-2">Your payment has been processed successfully</p>
        //         </CardHeader>

        //         <CardContent className="space-y-6">
        //             {/* Payment Details */}
        //             <div className="bg-gray-50 rounded-lg p-4 space-y-3">
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Transaction ID</span>
        //                     <span className="text-sm font-mono text-gray-900">#TXN-2024-001</span>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Amount</span>
        //                     <span className="text-lg font-semibold text-gray-900">$29.99</span>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Status</span>
        //                     <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Completed</Badge>
        //                 </div>
        //                 <div className="flex justify-between items-center">
        //                     <span className="text-sm text-gray-600">Date</span>
        //                     <span className="text-sm text-gray-900">{new Date().toLocaleDateString()}</span>
        //                 </div>
        //             </div>

        //             {/* Next Steps */}
        //             <div className="space-y-3">
        //                 <h3 className="font-semibold text-gray-900">What&#39;s Next?</h3>
        //                 <ul className="space-y-2 text-sm text-gray-600">
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        //                         You&#39;ll receive a confirmation email shortly
        //                     </li>
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        //                         Your premium features are now active
        //                     </li>
        //                     <li className="flex items-center gap-2">
        //                         <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
        //                         Access your receipt in your account
        //                     </li>
        //                 </ul>
        //             </div>

        //             {/* Action Buttons */}
        //             <div className="space-y-3">
        //                 <Button asChild className="w-full bg-green-600 hover:bg-green-700">
        //                     <Link href="/" className="flex items-center justify-center gap-2">
        //                         Continue to Dashboard
        //                         <ArrowRight className="w-4 h-4" />
        //                     </Link>
        //                 </Button>

        //                 <div className="flex gap-2">
        //                     <Button variant="outline" className="flex-1 bg-transparent" size="sm">
        //                         <Download className="w-4 h-4 mr-2" />
        //                         Receipt
        //                     </Button>
        //                     <Button variant="outline" asChild className="flex-1 bg-transparent" size="sm">
        //                         <Link href="/" className="flex items-center justify-center gap-2">
        //                             <Home className="w-4 h-4 mr-2" />
        //                             Home
        //                         </Link>
        //                     </Button>
        //                 </div>
        //             </div>
        //         </CardContent>
        //     </Card>
        // </div>
        <PaymentSuccessCard />
    )
}
