"use client"
import React from "react"
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import {cn} from "@/lib/utils"
import {ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight} from "lucide-react"
import {Button} from "@/components/ui/button"

interface CustomPaginationProps {
    currentPage: number
    totalPages: number
    onPageChangeAction: (page: number) => void
    maxPagesToShow?: number
    className?: string
}

export default function CustomPagination({
                                             currentPage,
                                             totalPages,
                                             onPageChangeAction,
                                             maxPagesToShow = 5,
                                             className
                                         }: CustomPaginationProps) {
    const getPageNumbers = () => {
        const pageNumbers: number[] = []
        let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
        const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)

        if (endPage - startPage + 1 < maxPagesToShow) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1)
        }

        for (let i = startPage; i <= endPage; i++) {
            pageNumbers.push(i)
        }
        return pageNumbers
    }

    const pageNumbers = getPageNumbers()

    return (
        <div className={cn('flex items-center justify-end gap-2', className)}>
            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChangeAction(1)}
                disabled={currentPage === 1}
                className="h-9 w-9"
            >
                <ChevronsLeft className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChangeAction(currentPage - 1)}
                disabled={currentPage === 1}
                className="h-9 w-9"
            >
                <ChevronLeft className="h-4 w-4" />
            </Button>

            {pageNumbers[0] > 1 && (
                <>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChangeAction(1)}
                        className="h-9 w-9"
                    >
                        1
                    </Button>
                    {pageNumbers[0] > 2 && (
                        <span className="px-2">...</span>
                    )}
                </>
            )}

            {pageNumbers.map((page) => (
                <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="icon"
                    onClick={() => onPageChangeAction(page)}
                    className="h-9 w-9"
                >
                    {page}
                </Button>
            ))}

            {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                    {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                        <span className="px-2">...</span>
                    )}
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPageChangeAction(totalPages)}
                        className="h-9 w-9"
                    >
                        {totalPages}
                    </Button>
                </>
            )}

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChangeAction(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
            >
                <ChevronRight className="h-4 w-4" />
            </Button>

            <Button
                variant="outline"
                size="icon"
                onClick={() => onPageChangeAction(totalPages)}
                disabled={currentPage === totalPages}
                className="h-9 w-9"
            >
                <ChevronsRight className="h-4 w-4" />
            </Button>
        </div>
    )
}