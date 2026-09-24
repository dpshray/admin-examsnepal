"use client";

import { useRouter } from "next/navigation";
import { FilePlus2 } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import NoticeForm from "@/components/notices/NoticeForm";
import { useSaveNotice } from "@/hooks/useNotices";

export default function NewNoticePage() {
  const router = useRouter();
  const save = useSaveNotice();

  return (
    <div className="mx-auto w-full max-w-5xl space-y-6 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={FilePlus2}
        title="Add notice"
        description="For manual sources (e.g. NMC, TSC) and urgent notices. Always link the official notice."
      />
      <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
        <NoticeForm
          submitting={save.isPending}
          submitLabel="Create notice"
          onSubmit={(payload) =>
            save.mutate({ data: payload }, { onSuccess: (res: any) => router.push(`/notices/${res?.data?.id}`) })
          }
        />
      </div>
    </div>
  );
}
