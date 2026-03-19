"use client";

import PageHeader from "@/components/header/PageHeader";
import BlogTable from "@/components/table/BlogTable";
import { FileText } from "lucide-react";

export default function BlogPage() {
    return (
        <div className="p-4 sm:p-6">
            <PageHeader
                title="Blog Management"
                icon={FileText}
                description="Manage and oversee all blog posts."
            />
            <div className="mt-6">
                <BlogTable />
            </div>
        </div>
    );
}
