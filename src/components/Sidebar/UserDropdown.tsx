"use client"

import React, { useState } from "react"
import {Button} from "@/components/ui/button"
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {LogOut, type LucideIcon} from "lucide-react"
import Link from "next/link"

export type DropdownItem = {
    icon: LucideIcon
    label: string
    href: string
    onClick?: () => void
}

export type DropdownGroup = {
    items: DropdownItem[]
}

interface UserDropdownProps {
    user: {
        name: string
        email: string
        avatar?: string
        fallback?: string
    }
    groups: DropdownGroup[]
    onLogoutAction?: () => void
    align?: "start" | "end" | "center"
}

export default function UserDropdown({
    user,
    groups,
    onLogoutAction,
    align = "end",
}: UserDropdownProps) {
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const handleLogout = async () => {
        try {
        setIsLoggingOut(true);

        if (onLogoutAction) {
            onLogoutAction();
        } else {
            localStorage.clear();
            window.location.href = "/";
        }
        } catch (error) {
            console.error("Logout failed:", error);
        } finally {
            setIsLoggingOut(false);
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-auto p-0 hover:bg-transparent">
                    <Avatar className="border">
                        <AvatarImage
                            src={user.avatar || "/placeholder.svg"}
                            alt={`${user.name} profile image`}
                        />
                        <AvatarFallback>
                            {user.fallback || user.name.charAt(0).toUpperCase() || ""}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="max-w-64 w-full" align={align}>
                <DropdownMenuLabel className="flex flex-col min-w-0">
                      <span className="truncate text-sm font-medium text-foreground">
                        {user.name}
                      </span>
                    <span className="truncate text-xs font-normal text-muted-foreground">
            {user.email}
          </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator/>
                {groups.map((group, idx) => (
                    <React.Fragment key={idx}>
                        <DropdownMenuGroup>
                            {group.items.map(({icon: Icon, label, href, onClick}) => (
                                <DropdownMenuItem asChild key={href} onClick={onClick} className={'cursor-pointer'}>
                                    <Link href={href} className="flex items-center gap-2">
                                        <Icon className="h-4 w-4"/>
                                        <span>{label}</span>
                                    </Link>
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuGroup>
                        {idx < groups.length - 1 && <DropdownMenuSeparator/>}
                    </React.Fragment>
                ))}
                <DropdownMenuSeparator/>
                <DropdownMenuItem
                    onClick={handleLogout}
                    disabled={isLoggingOut}
                    className="cursor-pointer"
                >
                    <LogOut className="h-4 w-4" />
                    <span>{isLoggingOut ? "Logging out..." : "Logout"}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}