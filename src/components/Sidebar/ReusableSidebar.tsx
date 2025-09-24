"use client"
import type React from "react"
import {SidebarInset, SidebarProvider, SidebarTrigger} from "@/components/ui/sidebar"
import {Separator} from "@/components/ui/separator"
import {Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator} from "@/components/ui/breadcrumb"
import AppSidebar, { NavGroup } from "./AppSidebar"
import UserDropdown, { DropdownGroup } from "./UserDropdown"
import NotificationComponent, { NotificationItem } from "./notification"
import { usePathname, useRouter } from "next/navigation"
interface User {
    name: string
    email: string
    avatar?: string
    fallback: string
}
interface ReusableSidebarProps {
    children: React.ReactNode
    navGroups: NavGroup[]
    title?: string
    subtitle?: string
    currentHref?: string
    logo?: React.ReactNode
    user?: User
    dropdownGroups?: DropdownGroup[]
    notifications?: NotificationItem[]
    onLogout?: () => void
}

const breadcrumbMap: { [key: string]: string } = {
  "/": "",
  "/exam": "Exams",
  "/students": "Students",
  "/subscriptions": "Subscriptions"
};

export default function ReusableSidebar({
    children,
    navGroups,
    title,
    subtitle,
    currentHref,
    logo,
    user = {
        name: "ExamsNepal",
        email: "ExamsNepal",
        avatar: "/logo.svg",
        fallback: "EN",
    },
    dropdownGroups = [],
    notifications = [],
    onLogout,
}: ReusableSidebarProps) {
    const pathname = usePathname();
    const currentLabel = breadcrumbMap[pathname] ?? "Admin";

    return (
        <SidebarProvider>
            <AppSidebar navGroups={navGroups} title={title} subtitle={subtitle} currentHref={currentHref} logo={logo}/>
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4 ">
                    <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9"/>
                    <Separator orientation="vertical" className="mr-2 h-4"/>
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem>
                                <BreadcrumbPage>{currentLabel}</BreadcrumbPage>
                            </BreadcrumbItem>
                        </BreadcrumbList>
                    </Breadcrumb>
                    <div className="ml-auto flex items-center gap-1 sm:gap-2">
                        <NotificationComponent notifications={notifications}/>
                        <UserDropdown user={user} groups={dropdownGroups} onLogoutAction={onLogout}/>
                    </div>
                </header>
                <main className="flex-1 space-y-4  sm:space-y-4 ">{children}</main>
            </SidebarInset>
        </SidebarProvider>
    )
}