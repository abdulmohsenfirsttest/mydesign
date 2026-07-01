"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdmin, type AdminSession } from "@/lib/roles";

type PricingQuote = {
  id: string;
  project_id: string;
  sqm_total: string | null;
  price_per_sqm: string | null;
  total: string | null;
  status: string;
  requested_by: string | null;
  approved_by: string | null;
  created_at: string;
  approved_at: string | null;
  projects: { name: string; clients: { name: string } | null } | null;
};

const sar = (n: number) => n.toLocaleString("en-SA", { minimumFractionDigits: 0, maximumFractionDigits: 2 });
const fmtDate = (d: string) => new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

export default function PricingPage() {
  const router = useRouter();
  const [admin, setAdmin] = useState<AdminSession | null>(null);
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [quotes, setQuotes] = useState<PricingQuote[]>([]);
  const [priceInputs, setPriceInputs] = useState<Record<string, string>>({});
  const [approving, setApproving] = useState<string | null>(null);
  const [error, setError] = useState("");

  function fetchQuotes() {
    supabase.from("internal_quotes").select("*, projects(name, clients(name))").order("created_at", { ascending: false })
      .then(({ data, error: err }) => {
        if (err) { setError(err.message); return; }
        setQuotes((data as PricingQuote[]) ?? []);
      });
  }

  useEffect(() => {
    const a = getAdmin();
    if (!a) { router.replace("/auth/login"); return; }
    setAdmin(a);
    if (a.role !== "manager") { setAuthorized(false); return; }
    setAuthorized(true);
    fetchQuotes();

    const channel = supabase.channel("admin-pricing")
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_quotes" }, fetchQuotes)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  async function approve(q: PricingQuote) {
    const price = Number(priceInputs[q.id]);
    if (!price || price <= 0) { setError("Enter a price per sqm before approving."); return; }
    setError("");
    setApproving(q.id);
    const total = Number(q.sqm_total) * price;
    const { error: err } = await supabase.from("internal_quotes").update({
      price_per_sqm: price,
      total,
      status: "approved",
      approved_by: admin?.id,
      approved_at: new Date().toISOString(),
    }).eq("id", q.id);
    if (err) { setError(err.message); setApproving(null); return; }
    setApproving(null);
    fetchQuotes();
  }

  if (authorized === null) return <div className="p-8"><p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p></div>;
  if (!authorized) return (
    <div className="p-8">
      <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Pricing</h1>
      <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Only the Manager can set pricing.</p>
    </div>
  );

  const pending = quotes.filter((q) => q.status === "pending");
  const approved = quotes.filter((q) => q.status === "approved");

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Pricing</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Set and approve the internal price per sqm. Approving unlocks the designer&apos;s proposal step.</p>
      </div>

      {error && <p className="text-red-400/70 text-xs mb-6" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}

      {quotes.length === 0 ? (
        <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No pricing requests yet.</p>
      ) : (
        <div className="space-y-10">
          <div>
            <p className="text-xs text-white/30 mb-4 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PENDING QUEUE</p>
            {pending.length === 0 ? (
              <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Nothing awaiting pricing.</p>
            ) : (
              <div className="space-y-4">
                {pending.map((q) => {
                  const sqm = Number(q.sqm_total);
                  const price = Number(priceInputs[q.id] || 0);
                  const liveTotal = sqm * price;
                  return (
                    <div key={q.id} className="border border-white/[0.08] bg-[#161616] p-6">
                      <div className="flex flex-wrap items-start justify-between gap-6">
                        <div>
                          <p className="text-white text-sm" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.clients?.name ?? "—"}</p>
                          <p className="text-white/30 text-xs mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.name ?? "—"} · requested {fmtDate(q.created_at)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/30 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TOTAL AREA</p>
                          <p className="text-white text-lg tabular-nums mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sqm.toLocaleString("en-US")} <span className="text-white/30 text-sm">sqm</span></p>
                        </div>
                      </div>

                      <div className="flex flex-wrap items-end justify-between gap-6 mt-6 pt-6 border-t border-white/[0.06]">
                        <div className="w-48">
                          <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Price per sqm (SAR)</label>
                          <input type="number" min="0" inputMode="decimal" value={priceInputs[q.id] ?? ""}
                            onChange={(e) => setPriceInputs((p) => ({ ...p, [q.id]: e.target.value }))}
                            placeholder="0"
                            className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                            style={{ fontFamily: "var(--font-inter)" }} />
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-white/30 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PROJECT TOTAL</p>
                          <p className="text-white text-xl tabular-nums mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sar(liveTotal)} <span className="text-white/30 text-sm">SAR</span></p>
                        </div>
                        <button onClick={() => approve(q)} disabled={approving === q.id}
                          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                          style={{ fontFamily: "var(--font-inter)" }}>{approving === q.id ? "Approving..." : "Approve"}</button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {approved.length > 0 && (
            <div>
              <p className="text-xs text-white/30 mb-4 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>APPROVED</p>
              <div className="border border-white/[0.08] bg-[#161616]">
                {approved.map((q, i) => (
                  <div key={q.id} className={`flex flex-wrap items-center justify-between gap-4 px-5 py-4 ${i < approved.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                    <div className="min-w-[10rem]">
                      <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.name ?? "—"}</p>
                      <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.clients?.name ?? "—"}{q.approved_at ? ` · approved ${fmtDate(q.approved_at)}` : ""}</p>
                    </div>
                    <div className="flex items-center gap-8 text-right">
                      <div>
                        <p className="text-xs text-white/25 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>SQM</p>
                        <p className="text-white/70 text-sm tabular-nums mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{Number(q.sqm_total).toLocaleString("en-US")}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/25 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PER SQM</p>
                        <p className="text-white/70 text-sm tabular-nums mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sar(Number(q.price_per_sqm))}</p>
                      </div>
                      <div>
                        <p className="text-xs text-white/25 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TOTAL</p>
                        <p className="text-white text-sm tabular-nums mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>{sar(Number(q.total))} <span className="text-white/30">SAR</span></p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
