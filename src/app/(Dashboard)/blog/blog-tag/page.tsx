'use client'
import {Tag} from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import BlogTagTable from "@/components/table/BlogTagTable";

export default function TagPage() {
    return (
        <div className="p-4 sm:p-6">
            <PageHeader 
                title={'Tags Dashboard'}
                icon={Tag}
                description={'Manage your tags'}
            />
            <div className={'mt-6  my-2'}>
                <BlogTagTable />
            </div>
        </div>
    )
}