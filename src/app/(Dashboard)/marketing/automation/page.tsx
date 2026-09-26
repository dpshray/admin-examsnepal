"use client";

import { MailCheck, OctagonPause, Play } from "lucide-react";
import PageHeader from "@/components/header/PageHeader";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutomationsPanel from "@/components/marketing/AutomationsPanel";
import MessageLogPanel from "@/components/marketing/MessageLogPanel";
import SuppressionsPanel from "@/components/marketing/SuppressionsPanel";
import BroadcastsPanel from "@/components/marketing/Broadcasts";
import { fmtDate, fmtInt } from "@/components/marketing/labels";
import { useMessagingStatus, useSetPaused } from "@/hooks/useMarketing";
import type { MessagingStatus } from "@/types/Marketing";

export default function EmailAutomationPage() {
  const { data } = useMessagingStatus();
  const status: MessagingStatus | undefined = data?.data;
  const setPaused = useSetPaused();

  return (
    <div className="mx-auto w-full max-w-7xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <PageHeader
        icon={MailCheck}
        title="Email automation"
        description="Behaviour-based emails with frequency caps, send windows and one-click unsubscribe."
      />

      {status && (
        <div
          className={`flex flex-wrap items-center gap-x-6 gap-y-3 rounded-xl border p-4 shadow-sm ${status.paused ? "border-amber-300 bg-amber-50" : "bg-card"}`}
        >
          <div className="min-w-56 flex-1">
            <p className="text-sm font-semibold text-gray-900">
              {status.paused ? "All automations are paused" : "Automations are running"}
            </p>
            <p className="text-xs text-gray-600">
              {status.paused
                ? "Nothing is sent. Queued messages wait (and expire after 3 days)."
                : `Sending as ${status.from}. ${status.send_window_open ? "Send window is open now." : `Next send window ${fmtDate(status.next_window_at, true)}.`}`}
            </p>
            {status.paused_changed && (
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {status.paused_changed.paused ? "Paused" : "Resumed"} by admin #{status.paused_changed.admin_id ?? "?"} on {fmtDate(status.paused_changed.at, true)}
              </p>
            )}
          </div>
          <dl className="flex gap-6 text-xs">
            <div><dt className="text-muted-foreground">Queued</dt><dd className="font-semibold tabular-nums">{fmtInt(status.queued)}</dd></div>
            <div><dt className="text-muted-foreground">Sent today</dt><dd className="font-semibold tabular-nums">{fmtInt(status.sent_today)}</dd></div>
            <div><dt className="text-muted-foreground">Last hour</dt><dd className="font-semibold tabular-nums">{fmtInt(status.sent_last_hour)} / {fmtInt(status.max_per_hour)}</dd></div>
            <div><dt className="text-muted-foreground">Suppressed</dt><dd className="font-semibold tabular-nums">{fmtInt(status.suppressed_addresses)}</dd></div>
          </dl>
          <Button
            variant={status.paused ? "default" : "outline"}
            className={status.paused ? "gap-1.5" : "gap-1.5 border-red-200 text-red-700 hover:bg-red-50"}
            disabled={setPaused.isPending}
            onClick={() => setPaused.mutate(!status.paused)}
          >
            {status.paused ? <Play className="h-4 w-4" /> : <OctagonPause className="h-4 w-4" />}
            {status.paused ? "Resume sending" : "Pause everything"}
          </Button>
        </div>
      )}

      <Tabs defaultValue="automations" className="space-y-4">
        <TabsList>
          <TabsTrigger value="automations">Automations</TabsTrigger>
          <TabsTrigger value="broadcasts">Broadcasts</TabsTrigger>
          <TabsTrigger value="log">Message log</TabsTrigger>
          <TabsTrigger value="suppressions">Suppressions</TabsTrigger>
        </TabsList>
        <div className="rounded-xl border bg-card p-4 shadow-sm sm:p-6">
          <TabsContent value="automations"><AutomationsPanel /></TabsContent>
          <TabsContent value="broadcasts"><BroadcastsPanel /></TabsContent>
          <TabsContent value="log"><MessageLogPanel /></TabsContent>
          <TabsContent value="suppressions"><SuppressionsPanel /></TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
