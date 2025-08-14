"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronUpIcon,} from "lucide-react"
import {useState} from "react"

import {cn} from "@/lib/utils"
import {usePagination} from "@/hooks/use-pagination"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Pagination, PaginationContent, PaginationEllipsis, PaginationItem,} from "@/components/ui/pagination"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"

interface DataTableProps<TData, TValue> {
    columns: ColumnDef<TData, TValue>[]
    data: TData[]
    currentPage?: number
    totalItems?: number
    pageSize?: number
    onPageChangeAction?: (page: number) => void
    onPageSizeChange?: (size: number) => void
    loading?: boolean
    className?: string
    pageSizeOptions?: number[]
    noDataText?: string
    tableClassName?: string
    defaultSort?: SortingState
}

export function ReusableDataTable<TData, TValue>({
                                                     columns,
                                                     data,
                                                     currentPage,
                                                     totalItems,
                                                     pageSize,
                                                     onPageChangeAction,
                                                     onPageSizeChange,
                                                     loading = false,
                                                     className,
                                                     pageSizeOptions = [5, 10, 20],
                                                     noDataText = "No results found.",
                                                     tableClassName = "",
                                                     defaultSort = [],
                                                 }: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>(
        defaultSort ?? []
    )


    const enablePagination =
        typeof currentPage === "number" &&
        typeof totalItems === "number" &&
        typeof pageSize === "number"

    const effectivePageSize = pageSize ?? 10
    const totalPages = enablePagination
        ? Math.max(1, Math.ceil(totalItems! / effectivePageSize))
        : 1

    const {pages, showLeftEllipsis, showRightEllipsis} = usePagination({
        currentPage: currentPage ?? 1,
        totalPages,
        paginationItemsToDisplay: 5,
    })

    const table = useReactTable({
        data,
        columns,
        state: {sorting},
        onSortingChange: setSorting,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
    })

    return (
        <div className={cn("flex flex-col gap-4")}>
            <div className={cn('overflow-x-auto ', className)}>
                <Table className={cn('table-auto text-left border-none', tableClassName)}>
                    <TableHeader className={''}>
                        {table.getHeaderGroups().map((headerGroup) => (
                            <TableRow key={headerGroup.id} className="hover:bg-transparent">
                                {headerGroup.headers.map((header) => (
                                    <TableHead
                                        key={header.id}
                                        style={{width: header.getSize()}}
                                        className="h-11 text-left"
                                    >
                                        {header.isPlaceholder ? null : header.column.getCanSort() ? (
                                            <button
                                                type="button"
                                                className="flex w-full items-center justify-between gap-2 cursor-pointer select-none"
                                                onClick={header.column.getToggleSortingHandler()}
                                                aria-label="Toggle sort"
                                            >
                                                {flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
                                                {{
                                                    asc: <ChevronUpIcon size={16}/>,
                                                    desc: <ChevronDownIcon size={16}/>,
                                                    false: <ChevronUpIcon size={16} className="opacity-20"/>,
                                                }[header.column.getIsSorted() as string] ?? null}
                                            </button>
                                        ) : (
                                            flexRender(header.column.columnDef.header, header.getContext())
                                        )}
                                    </TableHead>
                                ))}
                            </TableRow>
                        ))}
                    </TableHeader>

                    <TableBody>
                        {loading ? (
                            [...Array(effectivePageSize)].map((_, i) => (
                                <TableRow key={`skeleton-${i}`}>
                                    {columns.map((_, j) => (
                                        <TableCell key={`skeleton-cell-${j}`}>
                                            <Skeleton className="h-4 w-full"/>
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : table.getRowModel().rows.length ? (
                            table.getRowModel().rows.map((row) => (
                                <TableRow key={row.id}>
                                    {row.getVisibleCells().map((cell) => (
                                        <TableCell key={cell.id}>
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </TableCell>
                                    ))}
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={columns.length} className="h-24 text-center">
                                    {noDataText}
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {enablePagination && (
                <div className="flex items-center justify-between gap-3 max-sm:flex-col">
                    <p className="text-sm text-muted-foreground whitespace-nowrap">
                        Page <span className="text-foreground">{currentPage}</span> of {" "}
                        <span className="text-foreground">{totalPages}</span>
                    </p>

                    <Pagination className="grow">
                        <PaginationContent>
                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => onPageChangeAction?.(currentPage! - 1)}
                                    disabled={currentPage! <= 1}
                                >
                                    <ChevronLeftIcon size={16}/>
                                </Button>
                            </PaginationItem>

                            {showLeftEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis/>
                                </PaginationItem>
                            )}

                            {pages.map((page) => (
                                <PaginationItem key={page}>
                                    <Button
                                        size="icon"
                                        variant={page === currentPage ? "outline" : "ghost"}
                                        onClick={() => onPageChangeAction?.(page)}
                                        aria-current={page === currentPage ? "page" : undefined}
                                    >
                                        {page}
                                    </Button>
                                </PaginationItem>
                            ))}

                            {showRightEllipsis && (
                                <PaginationItem>
                                    <PaginationEllipsis/>
                                </PaginationItem>
                            )}

                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => onPageChangeAction?.(currentPage! + 1)}
                                    disabled={currentPage! >= totalPages}
                                >
                                    <ChevronRightIcon size={16}/>
                                </Button>
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>

                    <div className="flex flex-1 justify-end pr-2">
                        <Select
                            value={String(effectivePageSize)}
                            onValueChange={(value) => onPageSizeChange?.(Number(value))}
                        >
                            <SelectTrigger className="w-fit whitespace-nowrap">
                                <SelectValue placeholder="Results per page"/>
                            </SelectTrigger>
                            <SelectContent>
                                {pageSizeOptions.map((size) => (
                                    <SelectItem key={size} value={String(size)}>
                                        {size} / page
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                </div>
            )}
        </div>
    )
}
