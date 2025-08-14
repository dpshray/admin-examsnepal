"use client"

import {Card, CardContent, CardFooter, CardHeader} from "@/components/ui/card"

export default function ExamSkeletonCard() {
    return (
        <Card className="flex flex-col h-full">
            <CardHeader>
                <div className="flex items-start justify-between">
                    <div className="h-6 bg-gray-200 rounded animate-pulse flex-1 mr-4"></div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse"></div>
                </div>
            </CardHeader>

            <CardContent className="flex-1">
                <div className="space-y-2 mb-4">
                    <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4"></div>
                    <div className="h-4 bg-gray-200 rounded animate-pulse w-1/2"></div>
                </div>

                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 w-8 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                    <div className="flex justify-between items-center">
                        <div className="h-3 w-18 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-5 w-16 bg-gray-200 rounded animate-pulse"></div>
                    </div>
                </div>
            </CardContent>

            <CardFooter className="pt-4">
                <div className="h-10 bg-gray-200 rounded animate-pulse w-full"></div>
            </CardFooter>
        </Card>
    )
}
