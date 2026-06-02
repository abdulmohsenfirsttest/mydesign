"use client";
import { useState } from "react";

const quotes = [
  {
    id: "Q-1042", project: "Jewelry Store — Riyadh Gallery", date: "Jun 2, 2026", amount: "SAR 285,000",
    status: "Pending Signature", breakdown: [
      { item: "Design & Documentation", amount: "SAR 85,000" },
      { item: "3D Visualization", amount: "SAR 35,000" },
      { item: "Fit-out Supervision", amount: "SAR 65,000" },
      { item: "Materials & Procurement", amount: "SAR 100,000" },
    ],
  },
  {
    id: "Q-1031", project: "Villa Interior — Al Nakheel", date: "Mar 5, 2026", amount: "SAR 420,000",
    status: "Signed", breakdown: [
      { item: "Full Interior Design Package", amount: "SAR 120,000" },
      { item: "3D Renders & Visualization", amount: "SAR 50,000" },
      { item: "Project Management", amount: "SAR 80,000" },
      { item: "Materials & Fit-out", amount: "SAR 170,000" },
    ],
  },
  {
    id: "Q-1038", project: "Corporate Office — NEOM", date: "May 20, 2026", amount: "SAR 680,000",
    status: "Draft", breakdown: [],
  },
];

export default function FinancialsPage() {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Financial Offers</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Review and sign your project quotations.</p>
      </div>

      <div className="space-y-3">
        {quotes.map(q => (
          <div key={q.id} className="border border-white/[0.08] bg-[#161616]">
            <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors">
              <div className="flex items-center gap-6 text-left">
                <div>
                  <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.id}</p>
                  <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{q.project} · {q.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <span className="text-white text-sm" style={{ fontFamily: "var(--font-playfair)" }}>{q.amount}</span>
                <span className={`text-xs px-3 py-1 border ${q.status === "Signed" ? "border-white/20 text-white/40" : q.status === "Draft" ? "border-white/10 text-white/20" : "border-white/50 text-white/70"}`}
                  style={{ fontFamily: "var(--font-inter)" }}>{q.status}</span>
                <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded === q.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/>
                </svg>
              </div>
            </button>

            {expanded === q.id && (
              <div className="border-t border-white/[0.06] px-6 py-5">
                {q.breakdown.length > 0 ? (
                  <>
                    <div className="space-y-2 mb-5">
                      {q.breakdown.map(b => (
                        <div key={b.item} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                          <span className="text-white/40">{b.item}</span>
                          <span className="text-white/60">{b.amount}</span>
                        </div>
                      ))}
                      <div className="flex justify-between text-sm pt-3 border-t border-white/[0.08]" style={{ fontFamily: "var(--font-inter)" }}>
                        <span className="text-white/60">Total</span>
                        <span className="text-white">{q.amount}</span>
                      </div>
                    </div>
                    {q.status === "Pending Signature" && (
                      <button className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        Sign with DocuSign →
                      </button>
                    )}
                    {q.status === "Signed" && (
                      <p className="text-white/20 text-xs flex items-center gap-2" style={{ fontFamily: "var(--font-inter)" }}>
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7"/></svg>
                        Signed on Mar 5, 2026
                      </p>
                    )}
                  </>
                ) : (
                  <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Quote breakdown will be available once the discovery phase is complete.</p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
