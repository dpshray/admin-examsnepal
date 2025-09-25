"use client"

import type React from "react"
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
} from "@/components/ui/sidebar"
import Link from "next/link"
import type {LucideIcon} from "lucide-react"
import {cn} from "@/lib/utils";
import {usePathname} from "next/navigation";

export type NavItem = {
    label: string
    href: string
    icon: LucideIcon
}

export type NavGroup = {
    label: string
    items: NavItem[]
}

interface SidebarProps {
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    currentHref?: string
    logo?: React.ReactNode
}

function SidebarNavGroup({group}: { group: NavGroup; currentHref?: string }) {
    const pathname = usePathname()
    return (
        <SidebarGroup className={' p-2 border-b'}>
            <SidebarGroupLabel className="text-xs">{group.label}</SidebarGroupLabel>
            <SidebarGroupContent>
                <SidebarMenu>
                    {group.items.map((item) => (
                        <SidebarMenuItem key={item.href}>
                            <SidebarMenuButton asChild
                                               className={cn(pathname === item.href ? "bg-gradient-to-l from-green-400 to-green-600 !text-white" : "")}>
                                <Link href={item.href} className="flex items-center gap-2 truncate">
                                    <item.icon className="h-4 w-4 flex-shrink-0"/>
                                    <span className="truncate">{item.label}</span>
                                </Link>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                </SidebarMenu>
            </SidebarGroupContent>
        </SidebarGroup>
    )
}

export default function AppSidebar({
        navGroups,
        title = "App Title",
        subtitle = "Admin Dashboard",
        currentHref,
        logo,
    }: SidebarProps) {
    return (
        <Sidebar>
            <SidebarHeader className="border-b px-6 py-4 h-16">
                <div className="flex items-center gap-3">
                    <div className="flex h-8 w-10 items-center justify-center rounded-lg border shrink-0">
                        {logo}
                    </div>
                    <div className="min-w-0">
                        <h2 className="font-semibold text-lg truncate">{title}</h2>
                        <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
                    </div>
                </div>
            </SidebarHeader>
            <SidebarContent className="p-2">
                {navGroups.map((group) => (
                    <SidebarNavGroup key={group.label} group={group} currentHref={currentHref}/>
                ))}
            </SidebarContent>
        </Sidebar>
    )
}