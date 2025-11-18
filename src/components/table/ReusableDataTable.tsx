"use client"

import {
    ColumnDef,
    flexRender,
    getCoreRowModel,
    getSortedRowModel,
    SortingState,
    useReactTable,
} from "@tanstack/react-table"
import {ChevronDownIcon, ChevronLeftIcon, ChevronRightIcon, ChevronsLeftIcon, ChevronsRightIcon, ChevronsUpDown, ChevronUpIcon, CircleX, Search,} from "lucide-react"
import {useEffect, useId, useRef, useState} from "react"

import {cn} from "@/lib/utils"
import {usePagination} from "@/hooks/use-pagination"
import {Button} from "@/components/ui/button"
import {Skeleton} from "@/components/ui/skeleton"
import {Table, TableBody, TableCell, TableHead, TableHeader, TableRow,} from "@/components/ui/table"
import {Pagination, PaginationContent, PaginationEllipsis, PaginationItem,} from "@/components/ui/pagination"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import { useDebounce } from "@/hooks/use-Debounce"
import { Input } from "../ui/input"
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "../ui/command"

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
    onSearchAction?: (value: string) => void
    searchPlaceholder?: string
    enableSearch?: boolean
    // examTypeOptions?: { value: string | number; label: string }[]
    // selectedExamType?: string | number
    // onExamTypeChange?: (value: string | number) => void
    filters?: TableFilter[]
}

interface TableFilter {
  label: string
  placeholder?: string
  options: { value: string | number; label: string }[]
  selectedValue?: string | number
  onChange: (value: string | number) => void
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
    searchPlaceholder = "Search...",
    enableSearch = true,
    onSearchAction,
    pageSizeOptions = [5, 10, 20],
    noDataText = "No results found.",
    tableClassName = "",
    defaultSort = [],
    filters,
}: DataTableProps<TData, TValue>) {
    const [sorting, setSorting] = useState<SortingState>(
        defaultSort ?? []
    )
    const [search, setSearch] = useState("")
    const debouncedSearch = useDebounce(search, 500)
    const id = useId()
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (onSearchAction) {
            onSearchAction(debouncedSearch)
        }
    }, [debouncedSearch, onSearchAction])


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

    const clearSearch = () => {
        setSearch("")
        inputRef.current?.focus()
    }

    const hasSearch = Boolean(search)

    return (
        <div className={cn("flex flex-col gap-4")}>
            {enableSearch && (
                <div className="flex flex-col sm:flex-row items-center gap-2 w-full sm:w-auto flex-wrap">
                    <div className="flex">
                        <div className="relative">
                            <Input
                                id={`${id}-search`}
                                ref={inputRef}
                                className={cn("max-w-sm pl-9 sm:min-w-60")}
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder={searchPlaceholder}
                                type="text"
                                aria-label="Search table"
                            />
                            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center justify-center pl-3 text-muted-foreground">
                                <Search size={16} aria-hidden="true" />
                            </div>
                        </div>

                        {hasSearch && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={clearSearch}
                                aria-label="Clear search"
                                className="shrink-0"
                            >
                                <CircleX size={16} />
                            </Button>
                        )}
                    </div>

                    {filters?.map((filter, index) => (
                        <Popover key={index}>
                            <PopoverTrigger asChild>
                            <Button
                                variant="outline"
                                role="combobox"
                                className="w-64 justify-between"
                            >
                                <span className="truncate max-w-[95%]">
                                {filter.selectedValue
                                    ? filter.options.find((opt) => String(opt.value) === String(filter.selectedValue))?.label
                                    : filter.placeholder ?? filter.label}
                                </span>
                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                            </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-64 p-0">
                            <Command>
                                <CommandInput placeholder={`Search ${filter.label.toLowerCase()}...`} />
                                <CommandList className="custom-scrollbar">
                                <CommandEmpty>No {filter.label.toLowerCase()} found.</CommandEmpty>
                                <CommandGroup>
                                    <CommandItem
                                    key="all"
                                    onSelect={() => {
                                        filter.onChange("all")
                                    }}
                                    >
                                    All
                                    </CommandItem>
                                    {filter.options.map((opt) => (
                                    <CommandItem
                                        key={opt.value}
                                        onSelect={() => {
                                        filter.onChange(String(opt.value))
                                        }}
                                    >
                                        {opt.label}
                                    </CommandItem>
                                    ))}
                                </CommandGroup>
                                </CommandList>
                            </Command>
                            </PopoverContent>
                        </Popover>
                    ))}


                </div>

            )}
            
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
                                    onClick={() => onPageChangeAction?.(1)}
                                    disabled={currentPage! === 1}
                                >
                                    <ChevronsLeftIcon size={16} />
                                </Button>
                            </PaginationItem>

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

                            <PaginationItem>
                                <Button
                                    size="icon"
                                    variant="outline"
                                    onClick={() => onPageChangeAction?.(totalPages)}
                                    disabled={currentPage! === totalPages}
                                >
                                    <ChevronsRightIcon size={16} />
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
