"use client";

import { Landmark } from "lucide-react";
import PageHeader from "@/components/header/PageHeader"; // adjust path
import PaymentSettingsTable from "@/components/table/PaymentSettingsTable";

export default function PaymentSettingsPage() {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <PageHeader
        icon={Landmark}
        title="Payment Settings"
        description="Enable or disable available payment methods for subscriptions."
      />

      <div className="rounded-xl border bg-card shadow-sm">
        <div className="p-4 sm:p-6">
          <PaymentSettingsTable />
        </div>
      </div>
    </div>
  );
}
