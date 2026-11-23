"use client";

import PageHeader from "@/components/header/PageHeader";
import NotificationTable from "@/components/table/NotificationTable";
import { Bell } from "lucide-react";

export default function NotificationPage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Student Notifications"
        icon={Bell}
        description="Send and manage notifications for students."
      />
      <div className="mt-6">
        <NotificationTable />
      </div>
    </div>
  );
}
