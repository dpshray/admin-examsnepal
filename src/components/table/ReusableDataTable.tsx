"use client"

import React, {memo, type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState} from "react"
import {
    type ColumnDef,
    type ColumnFiltersState,
    type ExpandedState,
    flexRender,
    getCoreRowModel,
    getExpandedRowModel,
    getFacetedUniqueValues,
    getSortedRowModel,
    type Row,
    type RowSelectionState,
    type SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {
    ChevronDown,
    ChevronFirst,
    ChevronLast,
    ChevronLeft,
    ChevronRight,
    ChevronUp,
    CircleAlert,
    CircleX,
    Plus,
    Search,
    Trash2,
} from "lucide-react"
import {Button} from "@/components/ui/button"
import {Input} from "@/components/ui/input"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow} from "@/components/ui/table"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Pagination, PaginationContent, PaginationEllipsis, PaginationItem} from "@/components/ui/pagination"
import {cn, generatePageRange} from "@/lib/utils"
import {useDebounce} from "@/hooks/use-Debounce"


interface DataTablePagination {
    page: number
    totalPages: number
    pageSize?: number
    onPageChangeAction: (page: number) => void
    dataCount?: number
}

interface DataTableProps<TData, TValue> {
    data: TData[]
    columns: ColumnDef<TData, TValue>[]
    onAddAction?: () => void
    onDeleteAction?: (selected: TData[]) => void
    extraActions?: ReactNode
    className?: string
    tableClassName?: string
    paginationClassName?: string
    loading?: boolean
    noDataText?: ReactNode
    pagination: DataTablePagination
    searchPlaceholder?: string
    enableSearch?: boolean
    enableColumnVisibility?: boolean
    enableRowSelection?: boolean
    enableSorting?: boolean
    onSearchAction?: (value: string) => void
    onColumnFiltersChange?: (filters: ColumnFiltersState) => void
    totalCount?: number
    actionLabel?: string
    enableExpanding?: boolean
    getRowCanExpand?: (row: Row<TData>) => boolean
    renderSubComponent?: (row: Row<TData>) => ReactNode
    children?: ReactNode
    error?: string | null
    onRetry?: () => void
}

const SkeletonRow = memo(({columnCount}: { columnCount: number }) => (
    <TableRow className="animate-in fade-in-50 duration-200">
        {Array.from({length: columnCount}).map((_, j) => (
            <TableCell key={j} className="h-12 sm:h-14 px-2 sm:px-3 md:px-4">
                <div
                    className="h-3 sm:h-4 w-full animate-pulse rounded-md bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%]"/>
            </TableCell>
        ))}
    </TableRow>
))

SkeletonRow.displayName = "SkeletonRow"

const EmptyRow = memo(({columnCount, noDataText}: { columnCount: number; noDataText: ReactNode }) => (
    <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnCount} className="h-32 sm:h-40 text-center px-2 sm:px-4">
            <div
                className="flex flex-col items-center justify-center gap-2 sm:gap-3 animate-in fade-in-50 zoom-in-95 duration-300">
                <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-gray-50 to-gray-100 ring-1 ring-gray-200/50">
                    <Search className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-gray-400" aria-hidden="true"/>
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-gray-600 px-4">{noDataText}</div>
            </div>
        </TableCell>
    </TableRow>
))

EmptyRow.displayName = "EmptyRow"

const ErrorRow = memo(({columnCount, error, onRetry}: { columnCount: number; error: string; onRetry?: () => void }) => (
    <TableRow className="hover:bg-transparent">
        <TableCell colSpan={columnCount} className="h-32 sm:h-40 text-center px-2 sm:px-4">
            <div
                className="flex flex-col items-center justify-center gap-2 sm:gap-3 animate-in fade-in-50 zoom-in-95 duration-300">
                <div
                    className="flex h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 items-center justify-center rounded-full bg-gradient-to-br from-red-50 to-red-100 ring-1 ring-red-200/50">
                    <CircleAlert className="h-5 w-5 sm:h-6 sm:w-6 md:h-8 md:w-8 text-red-500" aria-hidden="true"/>
                </div>
                <div className="text-xs sm:text-sm md:text-base font-medium text-gray-600 px-4">{error}</div>
                {onRetry && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onRetry}
                        className="text-xs sm:text-sm"
                    >
                        Try Again
                    </Button>
                )}
            </div>
        </TableCell>
    </TableRow>
))

ErrorRow.displayName = "ErrorRow"

export function ReusableDataTable<TData, TValue>({
                                                     data,
                                                     columns,
                                                     onAddAction,
                                                     onDeleteAction,
                                                     extraActions,
                                                     className,
                                                     tableClassName,
                                                     paginationClassName,
                                                     loading = false,
                                                     noDataText = "No data available.",
                                                     pagination,
                                                     searchPlaceholder = "Search...",
                                                     enableSearch = true,
                                                     enableRowSelection = true,
                                                     enableSorting = true,
                                                     onSearchAction,
                                                     onColumnFiltersChange,
                                                     actionLabel = "Add",
                                                     enableExpanding = false,
                                                     getRowCanExpand,
                                                     renderSubComponent,
                                                     children,
                                                     error,
                                                     onRetry,
                                                 }: DataTableProps<TData, TValue>) {
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null)
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
    const [sorting, setSorting] = useState<SortingState>([])
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
    const [rowSelection, setRowSelection] = useState<RowSelectionState>({})
    const [expanded, setExpanded] = useState<ExpandedState>({})

    useEffect(() => {
        if (onSearchAction && debouncedSearch !== undefined) {
            onSearchAction(debouncedSearch)
        }
    }, [debouncedSearch, onSearchAction])

    useEffect(() => {
        if (onColumnFiltersChange) {
            onColumnFiltersChange(columnFilters)
        }
    }, [columnFilters, onColumnFiltersChange])

    const handleSearchChange = useCallback((value: string) => {
        setSearch(value)
        pagination.onPageChangeAction(1)
    }, [pagination.onPageChangeAction])

    const handleColumnFiltersChange = useCallback((updater: ColumnFiltersState | ((old: ColumnFiltersState) => ColumnFiltersState)) => {
        setColumnFilters(updater)
    }, [])

    const table = useReactTable({
        data,
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: enableSorting ? getSortedRowModel() : undefined,
        getExpandedRowModel: enableExpanding ? getExpandedRowModel() : undefined,
        onSortingChange: enableSorting ? setSorting : undefined,
        onExpandedChange: enableExpanding ? setExpanded : undefined,
        enableSortingRemoval: false,
        onColumnFiltersChange: handleColumnFiltersChange,
        getFacetedUniqueValues: getFacetedUniqueValues(),
        manualPagination: true,
        pageCount: pagination.totalPages,
        enableRowSelection,
        onRowSelectionChange: setRowSelection,
        getRowCanExpand: enableExpanding ? getRowCanExpand : undefined,
        state: {
            sorting: enableSorting ? sorting : [],
            expanded: enableExpanding ? expanded : {},
            pagination: {
                pageIndex: pagination.page - 1,
                pageSize: pagination.pageSize || 10,
            },
            columnFilters,
            rowSelection,
        },
    })

    const selectedRows = table.getSelectedRowModel().rows.map((row) => row.original)
    const currentPage = pagination.page
    const totalPages = pagination.totalPages
    const currentPageSize = pagination.pageSize || 10
    const startIndex = (currentPage - 1) * currentPageSize + 1
    const endIndex = Math.min(currentPage * currentPageSize, pagination.dataCount || 0)

    const handleDeleteRows = useCallback(() => {
        if (selectedRows.length > 0) {
            onDeleteAction?.(selectedRows)
            table.resetRowSelection()
        }
    }, [selectedRows, onDeleteAction, table])

    const handlePageClick = useCallback((page: number) => {
        if (page > 0 && page <= totalPages) {
            pagination.onPageChangeAction(page)
        }
    }, [totalPages, pagination.onPageChangeAction])

    const clearSearch = useCallback(() => {
        setSearch("")
        pagination.onPageChangeAction(1)
        inputRef.current?.focus()
    }, [pagination.onPageChangeAction])

    const handleSortingClick = useCallback((handler: any) => (e: React.MouseEvent) => {
        e.preventDefault()
        handler?.(e)
    }, [])

    const handleKeyDown = useCallback((handler: any) => (e: React.KeyboardEvent) => {
        if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            handler?.(e)
        }
    }, [])

    const pageRange = useMemo(
        () => generatePageRange(currentPage, totalPages),
        [currentPage, totalPages]
    )

    const showPagination = totalPages > 1
    const hasSelectedRows = selectedRows.length > 0

    return (
        <div className={cn("space-y-3 sm:space-y-4 w-full", className)}>
            <div className="flex flex-col gap-2.5 sm:gap-3 md:gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:flex-wrap">
                    {enableSearch && (
                        <div className="relative w-full sm:w-auto sm:min-w-[240px] md:min-w-[280px] lg:min-w-[360px]">
                            <Input
                                id={`${id}-search`}
                                ref={inputRef}
                                className={cn(
                                    "w-full pl-9 sm:pl-10 pr-4 h-9 sm:h-10 text-xs sm:text-sm transition-all duration-200",
                                    "border-gray-200 focus:border-[#4a358e] focus:ring-2 focus:ring-[#4a358e]/20",
                                    "placeholder:text-gray-400",
                                )}
                                value={search}
                                onChange={(e) => handleSearchChange(e.target.value)}
                                placeholder={searchPlaceholder}
                                type="search"
                                aria-label="Search table"
                            />
                            <div
                                className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-2.5 sm:pl-3.5 text-gray-400">
                                <Search size={14} className="sm:w-4 sm:h-4" aria-hidden="true" strokeWidth={2}/>
                            </div>
                        </div>
                    )}
                    {children}
                </div>

                <div className="flex flex-col gap-2.5 sm:gap-3 sm:flex-row sm:items-center sm:flex-wrap lg:justify-end">
                    {enableRowSelection && hasSelectedRows && onDeleteAction && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    className="h-9 sm:h-10 gap-1.5 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-colors"
                                >
                                    <Trash2 size={14} className="sm:w-4 sm:h-4" aria-hidden="true" strokeWidth={2}/>
                                    <span className="font-medium">Delete ({selectedRows.length})</span>
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent className="max-w-[90vw] sm:max-w-md">
                                <div className="flex items-start gap-3 sm:gap-4">
                                    <div
                                        className="flex h-10 w-10 sm:h-12 sm:w-12 shrink-0 items-center justify-center rounded-full bg-red-50 ring-4 ring-red-100">
                                        <CircleAlert className="h-5 w-5 sm:h-6 sm:w-6 text-red-600" aria-hidden="true"
                                                     strokeWidth={2}/>
                                    </div>
                                    <div className="flex-1">
                                        <AlertDialogHeader>
                                            <AlertDialogTitle className="text-base sm:text-lg font-semibold">
                                                Delete {selectedRows.length} item{selectedRows.length > 1 ? "s" : ""}?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription
                                                className="text-xs sm:text-sm text-gray-600 mt-1.5 sm:mt-2">
                                                This action cannot be undone. The selected
                                                item{selectedRows.length > 1 ? "s" : ""} will be permanently deleted
                                                from the system.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                    </div>
                                </div>
                                <AlertDialogFooter className="flex-col sm:flex-row gap-2 mt-3 sm:mt-4">
                                    <AlertDialogCancel
                                        className="w-full sm:w-auto text-xs sm:text-sm">Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={handleDeleteRows}
                                        className="bg-red-600 text-white hover:bg-red-700 w-full sm:w-auto text-xs sm:text-sm transition-colors"
                                    >
                                        Delete
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                    {onAddAction && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={onAddAction}
                            className="h-9 sm:h-10 gap-1.5 sm:gap-2 w-full sm:w-auto text-xs sm:text-sm border-primary text-primary hover:bg-primary hover:text-white transition-colors font-medium"
                        >
                            <Plus size={14} className="sm:w-4 sm:h-4" aria-hidden="true" strokeWidth={2}/>
                            <span>{actionLabel}</span>
                        </Button>
                    )}
                    {extraActions}
                </div>
            </div>

            <div
                className="relative w-full overflow-hidden rounded-md sm:rounded-lg md:rounded-xl ring-1 ring-border min-w-0">
                <div className={cn("overflow-x-auto mx-auto w-full", tableClassName)}>
                    <Table className="min-w-full">
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}
                                          className="hover:bg-transparent border-b border-gray-200 bg-gray-50/50">
                                    {headerGroup.headers.map((header) => (
                                        <TableHead
                                            key={header.id}
                                            style={{width: header.getSize()}}
                                            className="h-10 sm:h-11 md:h-12 px-2 sm:px-3 md:px-4 text-xs sm:text-sm font-semibold text-gray-700 whitespace-nowrap"
                                        >
                                            {!header.isPlaceholder && (
                                                <div
                                                    className={cn(
                                                        "flex items-center gap-1.5 sm:gap-2 transition-colors",
                                                        enableSorting && header.column.getCanSort() && "cursor-pointer select-none hover:text-[#4a358e] group"
                                                    )}
                                                    onClick={enableSorting && header.column.getCanSort() ? handleSortingClick(header.column.getToggleSortingHandler()) : undefined}
                                                    tabIndex={enableSorting && header.column.getCanSort() ? 0 : undefined}
                                                    role={enableSorting && header.column.getCanSort() ? "button" : undefined}
                                                    onKeyDown={enableSorting && header.column.getCanSort() ? handleKeyDown(header.column.getToggleSortingHandler()) : undefined}
                                                    aria-label={enableSorting && header.column.getCanSort() ? `Sort by ${header.id}` : undefined}
                                                >
                                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                                    {enableSorting && header.column.getCanSort() && (
                                                        <div className="flex-shrink-0 transition-colors">
                                                            {header.column.getIsSorted() === "asc" && (
                                                                <ChevronUp size={14}
                                                                           className="sm:w-4 sm:h-4 text-[#4a358e]"
                                                                           aria-label="Sorted ascending"
                                                                           strokeWidth={2.5}/>
                                                            )}
                                                            {header.column.getIsSorted() === "desc" && (
                                                                <ChevronDown size={14}
                                                                             className="sm:w-4 sm:h-4 text-[#4a358e]"
                                                                             aria-label="Sorted descending"
                                                                             strokeWidth={2.5}/>
                                                            )}
                                                            {!header.column.getIsSorted() && (
                                                                <ChevronDown size={14}
                                                                             className="sm:w-4 sm:h-4 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                             aria-hidden="true" strokeWidth={2}/>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {loading ? (
                                Array.from({length: currentPageSize}).map((_, i) => (
                                    <SkeletonRow key={i} columnCount={columns.length}/>
                                ))
                            ) : error ? (
                                <ErrorRow columnCount={columns.length} error={error} onRetry={onRetry}/>
                            ) : table.getRowModel().rows.length > 0 ? (
                                table.getRowModel().rows.map((row) => (
                                    <React.Fragment key={row.id}>
                                        <TableRow
                                            data-state={row.getIsSelected() ? "selected" : undefined}
                                            className={cn(
                                                "hover:bg-gray-50/70 transition-colors border-b border-gray-100 last:border-0",
                                                row.getIsSelected() && "bg-[#4a358e]/5 hover:bg-[#4a358e]/10"
                                            )}
                                        >
                                            {row.getVisibleCells().map((cell) => (
                                                <TableCell key={cell.id}
                                                           className="h-12 sm:h-13 md:h-14 px-2 sm:px-3 md:px-4 text-xs sm:text-sm text-gray-700">
                                                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                                </TableCell>
                                            ))}
                                        </TableRow>
                                        {enableExpanding && row.getIsExpanded() && renderSubComponent && (
                                            <TableRow
                                                className="bg-gray-50/50 hover:bg-gray-50/50 border-b border-gray-100">
                                                <TableCell colSpan={columns.length} className="p-2 sm:p-3 md:p-4">
                                                    {renderSubComponent(row)}
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </React.Fragment>
                                ))
                            ) : (
                                <EmptyRow columnCount={columns.length} noDataText={noDataText}/>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {showPagination && (
                <div
                    className={cn("flex flex-col gap-3 sm:gap-4 sm:flex-row sm:items-center sm:justify-between", paginationClassName)}>
                    <div className="flex items-center justify-center sm:justify-start order-2 sm:order-1">
                        <span className="text-xs sm:text-sm text-gray-600 font-medium tabular-nums">
                            Showing <span className="text-gray-900 font-semibold">{startIndex}</span> to <span
                            className="text-gray-900 font-semibold">{endIndex}</span> of <span
                            className="text-gray-900 font-semibold">{pagination.dataCount}</span> results
                        </span>
                    </div>

                    <div className="flex items-center justify-center sm:justify-end order-1 sm:order-2">
                        <Pagination>
                            <PaginationContent className="flex-wrap justify-center gap-0.5 sm:gap-1">
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to first page"
                                        className="h-8 w-8 sm:h-9 sm:w-9 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronFirst size={14} className="sm:w-4 sm:h-4" aria-hidden="true"
                                                      strokeWidth={2}/>
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(currentPage - 1)}
                                        disabled={currentPage === 1}
                                        aria-label="Go to previous page"
                                        className="h-8 w-8 sm:h-9 sm:w-9 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLeft size={14} className="sm:w-4 sm:h-4" aria-hidden="true"
                                                     strokeWidth={2}/>
                                    </Button>
                                </PaginationItem>
                                {pageRange.map((page, index) => (
                                    <PaginationItem key={index} className="hidden xs:block sm:block">
                                        {page === "ellipsis" ? (
                                            <PaginationEllipsis/>
                                        ) : (
                                            <Button
                                                variant={page === currentPage ? "default" : "outline"}
                                                size="sm"
                                                onClick={() => handlePageClick(page as number)}
                                                className={cn(
                                                    "h-8 w-8 sm:h-9 sm:w-9 tabular-nums text-xs sm:text-sm font-medium transition-all",
                                                    page === currentPage
                                                        ? "bg-primary text-white hover:bg-primary/90 shadow-sm"
                                                        : "border-gray-200 hover:bg-gray-50 hover:border-gray-300"
                                                )}
                                                aria-label={`Go to page ${page}`}
                                                aria-current={page === currentPage ? "page" : undefined}
                                            >
                                                {page}
                                            </Button>
                                        )}
                                    </PaginationItem>
                                ))}
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(currentPage + 1)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Go to next page"
                                        className="h-8 w-8 sm:h-9 sm:w-9 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronRight size={14} className="sm:w-4 sm:h-4" aria-hidden="true"
                                                      strokeWidth={2}/>
                                    </Button>
                                </PaginationItem>
                                <PaginationItem>
                                    <Button
                                        size="icon"
                                        variant="outline"
                                        onClick={() => handlePageClick(totalPages)}
                                        disabled={currentPage === totalPages}
                                        aria-label="Go to last page"
                                        className="h-8 w-8 sm:h-9 sm:w-9 border-gray-200 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        <ChevronLast size={14} className="sm:w-4 sm:h-4" aria-hidden="true"
                                                     strokeWidth={2}/>
                                    </Button>
                                </PaginationItem>
                            </PaginationContent>
                        </Pagination>
                    </div>
                </div>
            )}
        </div>
    )
}