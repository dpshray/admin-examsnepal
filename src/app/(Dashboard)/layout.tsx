"use client";

import type React from "react";
import ReusableSidebar from "@/components/Sidebar/ReusableSidebar";
import { NavGroup } from "@/components/Sidebar/AppSidebar";
import { DropdownGroup } from "@/components/Sidebar/UserDropdown";
import { NotificationItem } from "@/components/Sidebar/notification";
import {
  User,
  FileText,
  Users,
  CreditCard,
} from "lucide-react";
import authService from "@/service/auth.service";
import Image from "next/image";

const navGroups: NavGroup[] = [
  {
    label: "Main",
    items: [
      {
        label: "Exams",
        href: "/exam",
        icon: FileText,
      },
      {
        label: "Students",
        href: "/students",
        icon: Users,
      },
      {
        label: "Subscriptions",
        href: "/subscriptions",
        icon: CreditCard,
      },
    ],
  },
];

const dropdownGroups: DropdownGroup[] = [
  {
    items: [
      {
        icon: User,
        label: "Profile",
        href: "/profile",
      }
    ],
  },
];

const notifications: NotificationItem[] = [
  {
    id: 1,
    user: "Alice",
    action: "placed an order",
    target: "#1234",
    timestamp: "2025-09-24T10:15:00Z",
    unread: true,
  },
  {
    id: 2,
    user: "Bob",
    action: "updated product",
    target: "Headphones",
    timestamp: "2025-09-23T18:30:00Z",
    unread: false,
  },
];

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ReusableSidebar
      navGroups={navGroups}
      title="ExamsNepal"
      subtitle="Admin Dashboard"
      currentHref="/dashboard"
      logo={<Image src="/logo.svg" alt="Logo" width={32} height={32} />}
      dropdownGroups={dropdownGroups}
      notifications={notifications}
      onLogout={() => {
        try {
            authService.logout()
            window.location.href = "/"
        } catch (error) {
            console.error("Logout failed:", error)
        }
    }}
    >
      {children}
    </ReusableSidebar>
  );
}
