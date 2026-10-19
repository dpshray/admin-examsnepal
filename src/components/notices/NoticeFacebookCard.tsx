"use client";

import { forwardRef } from "react";
import { Mukta } from "next/font/google";
import type { Notice } from "@/types/Notice";

// Mukta covers Devanagari and Latin. The card is rendered by the browser and
// captured with html-to-image, so Nepali conjuncts and matras are shaped
// correctly - server-side image libraries (GD, Satori) break them.
const mukta = Mukta({ subsets: ["devanagari", "latin"], weight: ["400", "600", "700", "800"], display: "block" });

export const FACEBOOK_CARD_SIZE = 1080;

const CATEGORY_LABELS: Record<string, string> = {
  loksewa: "लोकसेवा · Loksewa",
  entrance: "प्रवेश परीक्षा · Entrance",
  license: "लाइसेन्स · License",
};

const TYPE_LABELS: Record<string, string> = {
  vacancy: "Vacancy",
  exam_schedule: "Exam Schedule",
  result: "Result",
  admit_card: "Admit Card",
  syllabus: "Syllabus",
  interview: "Interview",
  entrance_form: "Application Form",
  license_exam: "License Exam",
  other: "Notice",
};

const GREEN = "#069C56";

function titleSize(title: string): number {
  const n = title.length;
  if (n <= 40) return 76;
  if (n <= 80) return 64;
  if (n <= 140) return 52;
  return 44;
}

function formatAd(date: string | null): string | null {
  if (!date) return null;
  const d = new Date(date);
  return Number.isNaN(d.getTime()) ? null : d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

/** 1080x1080 square image for the Facebook Page post of a notice. */
export const NoticeFacebookCard = forwardRef<HTMLDivElement, { notice: Notice }>(function NoticeFacebookCard({ notice }, ref) {
  const title = notice.title_en || notice.title_ne || notice.title_original;
  const facts = [
    notice.published_date_bs && { label: "Published", value: `${notice.published_date_bs} BS` },
    formatAd(notice.application_deadline_ad) && { label: "Apply by", value: formatAd(notice.application_deadline_ad)! },
    (notice.exam_date_bs || formatAd(notice.exam_date_ad)) && {
      label: "Exam date",
      value: notice.exam_date_bs ? `${notice.exam_date_bs} BS` : formatAd(notice.exam_date_ad)!,
    },
  ].filter(Boolean) as { label: string; value: string }[];

  return (
    <div
      ref={ref}
      className={mukta.className}
      style={{
        width: FACEBOOK_CARD_SIZE,
        height: FACEBOOK_CARD_SIZE,
        display: "flex",
        flexDirection: "column",
        background: "#ffffff",
        color: "#0f172a",
        overflow: "hidden",
      }}
    >
      <div style={{ background: GREEN, padding: "48px 64px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ background: "#ffffff", borderRadius: 20, padding: "14px 18px", display: "flex" }}>
            {/* eslint-disable-next-line @next/next/no-img-element -- html-to-image inlines plain <img> */}
            <img src="/logo.svg" alt="" width={150} height={66} style={{ display: "block" }} />
          </div>
        </div>
        <div style={{ color: "#ffffff", fontSize: 34, fontWeight: 700, textAlign: "right", lineHeight: 1.2 }}>
          {CATEGORY_LABELS[notice.category] ?? notice.category}
        </div>
      </div>

      <div style={{ flex: 1, padding: "56px 64px 40px", display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 28 }}>
          <span
            style={{
              background: "#ecfdf5",
              color: GREEN,
              border: `3px solid ${GREEN}`,
              borderRadius: 999,
              padding: "6px 24px",
              fontSize: 30,
              fontWeight: 700,
            }}
          >
            {TYPE_LABELS[notice.notice_type] ?? "Notice"}
          </span>
        </div>

        <div style={{ fontSize: 36, fontWeight: 600, color: "#475569", lineHeight: 1.3, marginBottom: 20 }}>{notice.organization}</div>

        <div
          style={{
            fontSize: titleSize(title),
            fontWeight: 800,
            lineHeight: 1.35,
            color: "#0f172a",
            display: "-webkit-box",
            WebkitLineClamp: 6,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div style={{ flex: 1 }} />

        {facts.length > 0 && (
          <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
            {facts.map((fact) => (
              <div key={fact.label} style={{ background: "#f1f5f9", borderRadius: 20, padding: "18px 28px" }}>
                <div style={{ fontSize: 26, color: "#64748b", fontWeight: 600 }}>{fact.label}</div>
                <div style={{ fontSize: 36, fontWeight: 700, color: "#0f172a" }}>{fact.value}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div
        style={{
          background: "#0f172a",
          color: "#ffffff",
          padding: "32px 64px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: 32,
        }}
      >
        <span style={{ fontWeight: 600 }}>Full notice &amp; official link</span>
        <span style={{ fontWeight: 800, color: "#4ade80" }}>examsnepal.com/notices</span>
      </div>
    </div>
  );
});
