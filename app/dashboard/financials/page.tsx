"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type Quote = { id: string; title: string; status: string; lines: { item: string; amount: string }[]; files: { name: string; size: string; url: string }[]; created_at: string; projects: { name: string } | null };

const statusStyle: Record<string, string> = {
  "Pending Signature": "border-white/50 text-white/70",
  "Signed": "border-white/20 text-white/40",
  "Draft": "border-white/10 text-white/20",
};

export default function FinancialsPage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [signing, setSigning] = useState<string | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem("client_id");
    if (!clientId) { router.push("/auth/login"); return; }

    function fetchQuotes() {
      supabase.from("quotes").select("*, projects(name)").eq("client_id", clientId!).order("created_at", { ascending: false })
        .then(({ data }) => { setQuotes((data as Quote[]) ?? []); setLoading(false); });
    }

    fetchQuotes();

    const channel = supabase.channel("client-financials")
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes", filter: `client_id=eq.${clientId}` }, fetchQuotes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function sign(id: string) {
    if (!confirm("By confirming, you agree to the terms of this quote.")) return;
    setSigning(id);
    await supabase.from("quotes").update({ status: "Signed" }).eq("id", id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: "Signed" } : q));
    setSigning(null);
  }

  function total(lines: { item: string; amount: string }[]) {
    return lines.reduce((sum, l) => {
      const n = parseFloat(l.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0).toLocaleString("en-SA", { minimumFractionDigits: 0 });
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Financial Offers</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Review and sign your project quotations.</p>
      </div>

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : quotes.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No financial offers yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {quotes.map(q => (
            <div key={q.id} className="border border-white/[0.08] bg-[#161616]">
              <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="text-left">
                  <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.title || q.projects?.name || "—"}</p>
                  <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.name ?? "—"} · {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm" style={{ fontFamily: "var(--font-playfair)" }}>SAR {total(q.lines)}</span>
                  <span className={`text-xs px-3 py-1 border ${statusStyle[q.status] ?? statusStyle["Draft"]}`} style={{ fontFamily: "var(--font-inter)" }}>{q.status}</span>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded === q.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </button>

              {expanded === q.id && (
                <div className="border-t border-white/[0.06] px-6 py-5">
                  <div className="space-y-2 mb-5">
                    {q.lines.map((l, j) => (
                      <div key={j} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                        <span className="text-white/40">{l.item}</span>
                        <span className="text-white/60">{l.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-3 border-t border-white/[0.08]" style={{ fontFamily: "var(--font-inter)" }}>
                      <span className="text-white/60">Total</span>
                      <span className="text-white">SAR {total(q.lines)}</span>
                    </div>
                  </div>
                  {q.files?.length > 0 && (
                    <div className="mb-5 space-y-2">
                      <p className="text-white/20 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ATTACHMENTS</p>
                      {q.files.map((f, j) => (
                        <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <span className="flex-1 text-white/50 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                          <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors ml-1" title="Open">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </a>
                          <button onClick={() => { const sep = f.url.includes("?") ? "&" : "?"; const a = document.createElement("a"); a.href = `${f.url}${sep}download=${encodeURIComponent(f.name)}`; a.click(); }}
                            className="text-white/20 hover:text-white/60 transition-colors" title="Download">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  {q.status === "Pending Signature" && (
                    <button onClick={() => sign(q.id)} disabled={signing === q.id}
                      className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-inter)" }}>
                      {signing === q.id ? "Signing..." : "Sign & Approve →"}
                    </button>
                  )}
                  {q.status === "Signed" && (
                    <p className="text-white/30 text-xs flex items-center gap-2" style={{ fontFamily: "var(--font-inter)" }}>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7"/></svg>
                      Signed on {new Date(q.created_at).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                    </p>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
