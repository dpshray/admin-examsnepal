"use client"

import type React from "react"
import { memo, useState } from "react"
import {
    Sidebar,
    SidebarContent,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import Link from "next/link"
import type { LucideIcon } from "lucide-react"
import { ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"
import Image from "next/image"

export type NavItem = {
    label: string
    href: string
    icon: LucideIcon
    children?: NavItem[]
}

export type NavGroup = {
    label: string
    items: NavItem[]
}

interface SidebarProps {
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    logo?: string
    currentHref?: string
}

// ── Leaf item (no children) ──────────────────────────────────────────────────
const LeafItem = memo(function LeafItem({ item }: { item: NavItem }) {
    const pathname = usePathname()
    const isActive = pathname === item.href
    const Icon = item.icon

    return (
        <SidebarMenuItem>
            <SidebarMenuButton
                asChild
                className={cn(
                    isActive && "bg-gradient-to-r from-green-400 to-green-600 text-white"
                )}
            >
                <Link
                    href={item.href}
                    className="flex items-center gap-2 truncate"
                    aria-current={isActive ? "page" : undefined}
                >
                    <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                    <span className="truncate">{item.label}</span>
                </Link>
            </SidebarMenuButton>
        </SidebarMenuItem>
    )
})

// ── Collapsible parent item (has children) ───────────────────────────────────
const ParentItem = memo(function ParentItem({ item }: { item: NavItem }) {
    const pathname = usePathname()

    // Auto-open if any child is active
    const isChildActive = item.children?.some((c) => pathname === c.href) ?? false
    const [open, setOpen] = useState(isChildActive)

    const Icon = item.icon

    return (
        <SidebarMenuItem>
            <Collapsible open={open} onOpenChange={setOpen}>
                <CollapsibleTrigger asChild>
                    <SidebarMenuButton
                        className={cn(
                            "w-full justify-between",
                            isChildActive && "text-green-600 font-medium"
                        )}
                    >
                        <span className="flex items-center gap-2 truncate">
                            <Icon className="h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            <span className="truncate">{item.label}</span>
                        </span>
                        <ChevronRight
                            className={cn(
                                "h-4 w-4 flex-shrink-0 text-muted-foreground transition-transform duration-200",
                                open && "rotate-90"
                            )}
                        />
                    </SidebarMenuButton>
                </CollapsibleTrigger>

                <CollapsibleContent>
                    <SidebarMenuSub>
                        {item.children!.map((child) => {
                            const isActive = pathname === child.href
                            const ChildIcon = child.icon
                            return (
                                <SidebarMenuSubItem key={child.href}>
                                    <SidebarMenuSubButton
                                        asChild
                                        className={cn(
                                            isActive &&
                                            "bg-gradient-to-r from-green-400 to-green-600 text-white"
                                        )}
                                    >
                                        <Link
                                            href={child.href}
                                            aria-current={isActive ? "page" : undefined}
                                            className="flex items-center gap-2 truncate"
                                        >
                                            <ChildIcon className="h-3.5 w-3.5 flex-shrink-0" aria-hidden="true" />
                                            <span className="truncate">{child.label}</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            )
                        })}
                    </SidebarMenuSub>
                </CollapsibleContent>
            </Collapsible>
        </SidebarMenuItem>
    )
})

// ── Group ────────────────────────────────────────────────────────────────────
const SidebarNavGroup = memo(function SidebarNavGroup({ group }: { group: NavGroup }) {
    return (
        <SidebarGroup className="p-2 border-b">
            <SidebarGroupLabel className="text-xs">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) =>
                        item.children?.length ? (
                            <ParentItem key={item.href} item={item} />
                        ) : (
                            <LeafItem key={item.href} item={item} />
                        )
                    )}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
})

// ── Root sidebar ─────────────────────────────────────────────────────────────
const AppSidebar = memo(function AppSidebar({
    navGroups,
    title = "App Title",
    subtitle = "Admin Dashboard",
    logo = "/logo.svg",
    currentHref
}: SidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4 h-16">
                <div className="flex items-center gap-3">
                    <div className="relative h-12 w-12 shrink-0">
                        <Link href={`${currentHref}`}>
                            <Image src={logo} alt={`${title} logo`} fill className="object-contain" priority />
                        </Link>
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-lg truncate">{title}</h2>
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                <nav aria-label="Main navigation">
                    {navGroups.map((group) => (
                        <SidebarNavGroup key={group.label} group={group} />
                    ))}
                </nav>
            </SidebarContent>
        </Sidebar>
    )
})

export default AppSidebar