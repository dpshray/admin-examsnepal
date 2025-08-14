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
import {cn} from "@/lib/utils";

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
        <Pagination className={cn('justify-end', className)}>
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        onClick={() => {
                            if (currentPage > 1) onPageChangeAction(currentPage - 1)
                        }}
                        aria-disabled={currentPage === 1}
                        aria-label="Previous page"
                        tabIndex={currentPage === 1 ? -1 : undefined}
                    />
                </PaginationItem>

                {pageNumbers[0] > 1 && (
                    <>
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChangeAction(1)}>1</PaginationLink>
                        </PaginationItem>
                        {pageNumbers[0] > 2 && (
                            <PaginationItem>
                                <PaginationEllipsis/>
                            </PaginationItem>
                        )}
                    </>
                )}

                {pageNumbers.map((page) => (
                    <PaginationItem key={page}>
                        <PaginationLink
                            onClick={() => onPageChangeAction(page)}
                            isActive={currentPage === page}
                            aria-current={currentPage === page ? "page" : undefined}
                        >
                            {page}
                        </PaginationLink>
                    </PaginationItem>
                ))}

                {pageNumbers[pageNumbers.length - 1] < totalPages && (
                    <>
                        {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                            <PaginationItem>
                                <PaginationEllipsis/>
                            </PaginationItem>
                        )}
                        <PaginationItem>
                            <PaginationLink onClick={() => onPageChangeAction(totalPages)}>{totalPages}</PaginationLink>
                        </PaginationItem>
                    </>
                )}

                <PaginationItem>
                    <PaginationNext
                        onClick={() => {
                            if (currentPage < totalPages) onPageChangeAction(currentPage + 1)
                        }}
                        aria-disabled={currentPage === totalPages}
                        aria-label="Next page"
                        tabIndex={currentPage === totalPages ? -1 : undefined}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    )
}
