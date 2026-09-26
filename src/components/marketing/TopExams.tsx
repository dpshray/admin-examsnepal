"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { TopExam } from "@/types/Marketing";
import { fmtInt, fmtPct } from "./labels";

const TYPE_LABEL: Record<string, string> = { free: "Free", sprint: "Sprint", mock: "Mock", topic: "Topic", other: "Other" };

function ExamTable({ rows, empty }: { rows: TopExam[]; empty: string }) {
  if (!rows.length) return <p className="py-8 text-center text-xs text-muted-foreground">{empty}</p>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="text-muted-foreground">
          <tr className="border-b">
            <th className="py-2 pr-2 text-left font-medium">Exam</th>
            <th className="px-2 py-2 text-left font-medium">Type</th>
            <th className="px-2 py-2 text-right font-medium">Attempts</th>
            <th className="px-2 py-2 text-right font-medium">Students</th>
            <th className="py-2 pl-2 text-right font-medium" title="Share of the exam's students who paid after taking it">Paid after</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.exam_id} className="border-b last:border-0">
              <td className="max-w-xs truncate py-2 pr-2 text-gray-900" title={r.exam_name}>{r.exam_name}</td>
              <td className="px-2 py-2 text-gray-600">{TYPE_LABEL[r.type]}</td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtInt(r.attempts)}</td>
              <td className="px-2 py-2 text-right tabular-nums">{fmtInt(r.students)}</td>
              <td className="py-2 pl-2 text-right tabular-nums">
                {fmtPct(r.conversion_rate)} <span className="text-muted-foreground">({fmtInt(r.converted)})</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function TopExams({ byAttempts, byConversion }: { byAttempts: TopExam[]; byConversion: TopExam[] }) {
  return (
    <section className="rounded-xl border bg-card p-4 shadow-sm sm:p-5">
      <Tabs defaultValue="attempts">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-gray-900">Top exams</h2>
            <p className="text-xs text-muted-foreground">Exams taken in the period</p>
          </div>
          <TabsList className="h-8">
            <TabsTrigger value="attempts" className="text-xs">By attempts</TabsTrigger>
            <TabsTrigger value="conversion" className="text-xs">By conversion to paid</TabsTrigger>
          </TabsList>
        </div>
        <TabsContent value="attempts"><ExamTable rows={byAttempts} empty="No exams taken in this period" /></TabsContent>
        <TabsContent value="conversion">
          <ExamTable rows={byConversion} empty="No exam had 20+ students in this period" />
        </TabsContent>
      </Tabs>
    </section>
  );
}
