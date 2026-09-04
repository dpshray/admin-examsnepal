'use client'
import {Layers} from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import CategoryTable from "@/components/table/BlogCategoryTable";

export default function CategoryPage() {
    return (
        <div className="p-4 sm:p-6">
            <PageHeader 
                title={'Blog Categories Dashboard'}
                icon={Layers}
                description={'Manage your categories'}
            />
            <div className={'mt-6  my-2'}>
                <CategoryTable/>
            </div>
        </div>
    )
}