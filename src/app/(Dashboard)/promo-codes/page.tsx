"use client";

import { Percent } from "lucide-react";
import PageHeader from "@/components/header/PageHeader"; // adjust path
import PromoCodeTable from "@/components/table/PromoCodeTable";

export default function PromoCodePage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader
        icon={Percent}
        title="Promo Codes"
        description="Create and manage discount promo codes for subscriptions."
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 sm:p-6">
          <PromoCodeTable />
        </div>
      </div>
    </div>
  );
}
