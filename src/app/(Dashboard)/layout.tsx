"use client";

import type React from "react";
import ReusableSidebar from "@/components/Sidebar/ReusableSidebar";
import { NavGroup } from "@/components/Sidebar/AppSidebar";
import { DropdownGroup } from "@/components/Sidebar/UserDropdown";
import {
  User,
  FileText,
  Users,
  ClipboardList, HelpCircle,
  Tags,
  LayoutGrid,
  CreditCard,
} from "lucide-react";
import authService from "@/service/auth.service";
import Image from "next/image";
import { toast } from "sonner";

const navGroups: NavGroup[] = [
    {
        label: "Dashboard",
        items: [
            {
              label: "Exams Management",
              href: "/exam",
              icon: FileText,
            },
            {
              label: "Exam Types",
              href: "/exam-types",
              icon: LayoutGrid,
            },
            {
              label: "Exam Tags",
              href: "/exam-tags",
              icon: Tags,
            },
            {
              label: "Student Directory",
              href: "/students",
              icon: Users,
            },
            {
              label: "Exam Submissions",
              href: "/submissions",
              icon: ClipboardList,
            },
            {
              label: "Student Doubts",
              href: "/doubts",
              icon: HelpCircle,
            },
            {
              label: "Subscription Cost",
              href: "/subscription-cost",
              icon: CreditCard,
            },
        ],
    },
]

const dropdownGroups: DropdownGroup[] = [
  {
    items: [
      {
        icon: User,
        label: "Profile",
        href: "#",
      }
    ],
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
      onLogout={async () => {
        try {
            await authService.logout()
            toast.success("Logged out successfully")
            window.location.href = "/"
        } catch (error) {
            toast.error("Logout failed: an unexpected error occurred")
            console.error("Logout failed:", error)
        }
    }}
    >
      {children}
    </ReusableSidebar>
  );
}
