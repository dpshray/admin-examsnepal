"use client";

import { useState } from "react";
import { Landmark } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Switch } from "@/components/ui/switch";
import {
  useGetPaymentSettings,
  useUpdatePaymentSettings,
} from "@/hooks/use-payment-settings";
import { ReusableDataTable } from "./ReusableDataTable";
import PaymentSettingFormDialog from "../modal/PaymentSettingFormDialog";

interface PaymentSetting {
  id: number;
  name: string;
  status: boolean;
  created_at: string;
  updated_at: string;
}

function StatusToggleCell({ item }: { item: PaymentSetting }) {
  const { mutate: updateStatus, isPending } = useUpdatePaymentSettings();

  return (
    <div className="flex items-center gap-2">
      <Switch
        checked={item.status}
        disabled={isPending}
        onCheckedChange={() =>
          updateStatus({ name: item.name, status: !item.status })
        }
        aria-label={`Toggle ${item.name}`}
      />
      <span
        className={`text-xs font-medium ${
          item.status ? "text-green-600" : "text-gray-400"
        }`}
      >
        {item.status ? "Active" : "Inactive"}
      </span>
    </div>
  );
}

export default function PaymentSettingsTable() {
  const { data, isLoading, isError, error } = useGetPaymentSettings();
  const [isFormOpen, setFormOpen] = useState(false);

  const items: PaymentSetting[] = data?.data ?? [];

  const columns: ColumnDef<PaymentSetting>[] = [
    {
      accessorKey: "name",
      header: () => (
        <div className="flex items-center gap-2 font-semibold text-gray-700">
          <Landmark className="h-4 w-4 text-blue-500" />
          Payment Method
        </div>
      ),
      cell: ({ row }) => (
        <span className="font-medium text-gray-900">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "status",
      header: () => <div className="font-semibold text-gray-700">Status</div>,
      cell: ({ row }) => <StatusToggleCell item={row.original} />,
    },
    {
      accessorKey: "updated_at",
      header: () => (
        <div className="font-semibold text-gray-700">Last Updated</div>
      ),
      cell: ({ row }) => (
        <span className="text-sm text-gray-500">
          {new Date(row.original.updated_at).toLocaleString()}
        </span>
      ),
    },
  ];

  if (isError) {
    return (
      <div className="p-6">
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 flex items-center gap-3">
          <svg
            className="h-5 w-5 text-red-400"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
          <div>
            <h3 className="text-sm font-medium text-red-800">
              Failed to load payment settings
            </h3>
            <p className="mt-1 text-sm text-red-700">
              {error?.message || "An unexpected error occurred"}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ReusableDataTable<PaymentSetting, any>
        data={items}
        columns={columns}
        loading={isLoading}
        onAddAction={() => setFormOpen(true)}
        actionLabel="Add Payment Method"
        enableSearch={false}
        enableSorting={false}
        totalCount={items.length}
        pagination={{
          page: 1,
          totalPages: 1,
          dataCount: items.length,
          onPageChangeAction: () => {},
        }}
      />

      <PaymentSettingFormDialog open={isFormOpen} onOpenChange={setFormOpen} />
    </div>
  );
}
