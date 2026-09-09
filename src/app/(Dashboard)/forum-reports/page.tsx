"use client";

import PageHeader from "@/components/header/PageHeader";
import ForumReportsTable from "@/components/table/ForumReportsTable";
import { Flag } from "lucide-react";

export default function ForumReportsPage() {
  return (
    <div className="p-4 sm:p-6">
      <PageHeader
        title="Forum Reports"
        icon={Flag}
        description="Review reported forum content and take moderation action."
      />
      <div className="mt-6">
        <ForumReportsTable />
      </div>
    </div>
  );
}
