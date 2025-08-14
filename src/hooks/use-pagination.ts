import {useMemo} from "react"

interface UsePaginationProps {
    currentPage: number
    totalPages: number
    paginationItemsToDisplay?: number
}

export function usePagination({
                                  currentPage,
                                  totalPages,
                                  paginationItemsToDisplay = 5,
                              }: UsePaginationProps) {
    return useMemo(() => {
        const totalPageNumbers = paginationItemsToDisplay
        const halfRange = Math.floor(totalPageNumbers / 2)

        let startPage = Math.max(1, currentPage - halfRange)
        let endPage = startPage + totalPageNumbers - 1

        if (endPage > totalPages) {
            endPage = totalPages
            startPage = Math.max(1, endPage - totalPageNumbers + 1)
        }

        const pages = []
        for (let i = startPage; i <= endPage; i++) {
            pages.push(i)
        }

        return {
            pages,
            showLeftEllipsis: startPage > 1,
            showRightEllipsis: endPage < totalPages,
        }
    }, [currentPage, totalPages, paginationItemsToDisplay])
}
