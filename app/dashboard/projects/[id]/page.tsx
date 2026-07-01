"use client";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = { id: string; name: string; type: string; stage: string; progress: number; started: string; status: string; description: string | null };
type Milestone = { id: string; name: string; description: string | null; status: string; due_date: string | null; start_date: string | null; end_date: string | null; files: { name: string; size: string; url: string }[] | null; sort_order: number };
type Quote = { id: string; title: string; status: string; lines: { item: string; amount: string }[]; files: { name: string; size: string; url: string }[]; created_at: string };
type FileRow = { id: string; name: string; size: string; url: string; created_at: string };
type Space = { id: string; name: string; sqm: string; sort_order: number };
type Proposal = { id: string; scope: string | null; stages: string | null; pricing: string | null; terms: string | null; status: string; client_comment: string | null; sent_at: string | null; decided_at: string | null; created_at: string; pdf_url: string | null };

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [files, setFiles] = useState<FileRow[]>([]);
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [signing, setSigning] = useState<string | null>(null);
  const [proposalComment, setProposalComment] = useState("");
  const [deciding, setDeciding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const clientId = localStorage.getItem("client_id");
    if (!clientId) { router.push("/auth/login"); return; }

    supabase.from("projects").select("*").eq("id", id).eq("client_id", clientId).single()
      .then(({ data }) => {
        if (!data) { router.push("/dashboard/projects"); return; }
        setProject(data);
        setLoading(false);
      });

    const fetchMilestones = () =>
      supabase.from("milestones").select("*").eq("project_id", id).order("sort_order").order("created_at")
        .then(({ data }) => setMilestones(data ?? []));

    const fetchQuotes = () =>
      supabase.from("quotes").select("*").eq("project_id", id).order("created_at", { ascending: false })
        .then(({ data }) => setQuotes((data as Quote[]) ?? []));

    const fetchFiles = () =>
      supabase.from("files").select("*").eq("project_id", id).order("created_at", { ascending: false })
        .then(({ data }) => setFiles(data ?? []));

    const fetchSpaces = () =>
      supabase.from("spaces").select("*").eq("project_id", id).order("sort_order").order("created_at")
        .then(({ data, error }) => {
          if (error) { setError(error.message); return; }
          setSpaces((data as Space[]) ?? []);
        });

    // Only ever surface client-visible proposals — drafts (and the staff-only internal_quotes) stay hidden.
    const fetchProposal = () =>
      supabase.from("proposals").select("*").eq("project_id", id).in("status", ["sent", "approved", "rejected"])
        .order("created_at", { ascending: false }).limit(1)
        .then(({ data, error }) => {
          if (error) { setError(error.message); return; }
          setProposal((data && data[0]) ? (data[0] as Proposal) : null);
        });

    fetchMilestones();
    fetchQuotes();
    fetchFiles();
    fetchSpaces();
    fetchProposal();

    const mlc = supabase.channel(`detail-milestones-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "milestones", filter: `project_id=eq.${id}` }, fetchMilestones)
      .subscribe();
    const qc = supabase.channel(`detail-quotes-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes", filter: `project_id=eq.${id}` }, fetchQuotes)
      .subscribe();
    const fc = supabase.channel(`detail-files-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "files", filter: `project_id=eq.${id}` }, fetchFiles)
      .subscribe();
    const sc = supabase.channel(`detail-spaces-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "spaces", filter: `project_id=eq.${id}` }, fetchSpaces)
      .subscribe();
    const pc = supabase.channel(`detail-proposals-${id}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "proposals", filter: `project_id=eq.${id}` }, fetchProposal)
      .subscribe();

    return () => {
      supabase.removeChannel(mlc);
      supabase.removeChannel(qc);
      supabase.removeChannel(fc);
      supabase.removeChannel(sc);
      supabase.removeChannel(pc);
    };
  }, [id, router]);

  async function signQuote(quoteId: string) {
    if (!confirm("By confirming, you agree to the terms of this quote.")) return;
    setSigning(quoteId);
    await supabase.from("quotes").update({ status: "Signed" }).eq("id", quoteId);
    setQuotes(prev => prev.map(q => q.id === quoteId ? { ...q, status: "Signed" } : q));
    setSigning(null);
  }

  async function decideProposal(status: "approved" | "rejected") {
    if (!proposal) return;
    setDeciding(true);
    setError(null);
    const comment = proposalComment.trim() || null;
    const { error } = await supabase.from("proposals")
      .update({ status, decided_at: new Date().toISOString(), client_comment: comment })
      .eq("id", proposal.id);
    if (error) { setError(error.message); setDeciding(false); return; }

    // On approval, move the project into Phase 2 (Mood Board) and seed the first
    // bundled deliverable (Mood Board + 2D) if the plan is still empty — so approval
    // produces visible forward motion instead of dead-ending on an empty timeline.
    if (status === "approved") {
      await supabase.from("projects").update({ stage: "Mood Board", progress: 28 }).eq("id", id);
      if (milestones.length === 0) {
        const iso = (d: Date) => d.toISOString().slice(0, 10);
        const plus = (n: number) => { const d = new Date(); d.setDate(d.getDate() + n); return iso(d); };
        await supabase.from("milestones").insert([
          { project_id: id, name: "Mood Board", status: "Upcoming", start_date: iso(new Date()), end_date: plus(7), due_date: plus(7), sort_order: 0, bundle: "moodboard_2d", files: [] },
          { project_id: id, name: "2D", status: "Upcoming", start_date: iso(new Date()), end_date: plus(14), due_date: plus(14), sort_order: 1, bundle: "moodboard_2d", files: [] },
        ]);
      }
      setProject(prev => prev ? { ...prev, stage: "Mood Board", progress: 28 } : prev);
    }

    setProposal(prev => prev ? { ...prev, status, client_comment: comment } : prev);
    setDeciding(false);
  }

  async function downloadFile(url: string, name: string) {
    const marker = "/storage/v1/object/public/files/";
    const idx = url.indexOf(marker);
    if (idx === -1) { window.open(url, "_blank"); return; }
    const path = decodeURIComponent(url.slice(idx + marker.length));
    const { data, error } = await supabase.storage.from("files").download(path);
    if (error || !data) { window.open(url, "_blank"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  function quoteTotal(lines: { item: string; amount: string }[]) {
    return lines.reduce((sum, l) => {
      const n = parseFloat(l.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0).toLocaleString("en-SA", { minimumFractionDigits: 0 });
  }

  if (loading) return (
    <div className="p-8">
      <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
    </div>
  );

  if (!project) return null;

  const progress = project.progress ?? 0;
  const currentStage = project.stage ?? "";
  const completed = milestones.filter(m => m.status === "Completed").length;
  const currentMilestone = milestones.find(m => m.status === "In Progress") ?? milestones.find(m => m.status === "Upcoming");

  const fmtDay = (d: string) =>
    new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" });
  const milestoneDateLabel = (m: Milestone) =>
    m.start_date && m.end_date ? `${fmtDay(m.start_date)} - ${fmtDay(m.end_date)}` :
    m.due_date ? fmtDay(m.due_date) : null;

  const milestoneStatusDot = (status: string) =>
    status === "Completed" ? "bg-white border-white" :
    status === "In Progress" ? "border-amber-400/80 bg-transparent" :
    "border-white/25 bg-transparent";

  const milestoneLineColor = (status: string) =>
    status === "Completed" ? "bg-white/40" : "bg-white/10";

  return (
    <div className="p-8">
      <div className="mb-8">
        <Link href="/dashboard/projects"
          className="text-white/30 text-xs hover:text-white/50 transition-colors mb-3 inline-block"
          style={{ fontFamily: "var(--font-inter)" }}>← Projects</Link>
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{project.name}</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>
          {project.type}{currentStage ? ` · ${currentStage}` : ""} · {progress}% complete
        </p>
      </div>

      {error && (
        <div className="mb-6 border border-red-500/30 bg-red-500/[0.06] text-red-300/80 text-xs px-4 py-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">

          {/* Milestone Plan */}
          <div className="border border-white/[0.08] bg-[#161616] p-6">
            <h2 className="text-white text-sm tracking-widest mb-6" style={{ fontFamily: "var(--font-inter)" }}>MILESTONE PLAN</h2>
            {milestones.length === 0 ? (
              <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No milestones set yet.</p>
            ) : (
              <div className="space-y-0">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex gap-4">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-3 h-3 rounded-full mt-0.5 border-2 flex-shrink-0 ${milestoneStatusDot(m.status)}`} />
                      {i < milestones.length - 1 && (
                        <div className={`w-px flex-1 mt-1 ${milestoneLineColor(m.status)}`} style={{ minHeight: "40px" }} />
                      )}
                    </div>
                    <div className="pb-6">
                      <div className="flex items-center gap-3 mb-1">
                        <span className={`text-sm ${m.status === "In Progress" ? "text-white" : m.status === "Completed" ? "text-white/50" : "text-white/25"}`}
                          style={{ fontFamily: "var(--font-inter)" }}>{m.name}</span>
                        {milestoneDateLabel(m) && (
                          <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                            {milestoneDateLabel(m)}
                          </span>
                        )}
                        {m.status === "In Progress" && (
                          <span className="text-xs border border-amber-400/30 text-amber-400/60 px-2 py-0.5" style={{ fontFamily: "var(--font-inter)" }}>Current</span>
                        )}
                        {m.status === "Completed" && (
                          <span className="text-xs border border-white/10 text-white/30 px-2 py-0.5" style={{ fontFamily: "var(--font-inter)" }}>Done</span>
                        )}
                      </div>
                      {m.description && (
                        <p className="text-white/30 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{m.description}</p>
                      )}
                      {m.files && m.files.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {m.files.map((f, j) => (
                            <button key={j} onClick={() => downloadFile(f.url, f.name)}
                              className="flex items-center gap-2 text-white/30 hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
                              <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                              <span className="text-xs truncate">{f.name}</span>
                              {f.size && <span className="text-white/15 text-xs">{f.size}</span>}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Proposal */}
          {proposal && (
            <div className="border border-white/[0.08] bg-[#161616] p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PROPOSAL</h2>
                {proposal.status === "approved" && (
                  <span className="text-xs px-2.5 py-1 border border-white/20 text-white/50" style={{ fontFamily: "var(--font-inter)" }}>Approved</span>
                )}
                {proposal.status === "rejected" && (
                  <span className="text-xs px-2.5 py-1 border border-white/10 text-white/30" style={{ fontFamily: "var(--font-inter)" }}>Rejected</span>
                )}
                {proposal.status === "sent" && (
                  <span className="text-xs px-2.5 py-1 border border-white/50 text-white/70" style={{ fontFamily: "var(--font-inter)" }}>Awaiting Your Decision</span>
                )}
              </div>

              <div className="space-y-5">
                {([
                  { label: "SCOPE OF WORK", value: proposal.scope },
                  { label: "STAGES OF WORK", value: proposal.stages },
                  { label: "PRICING", value: proposal.pricing },
                  { label: "TERMS & CONDITIONS", value: proposal.terms },
                ] as { label: string; value: string | null }[]).map(sec => sec.value ? (
                  <div key={sec.label}>
                    <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>{sec.label}</p>
                    <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{sec.value}</p>
                  </div>
                ) : null)}
              </div>

              {proposal.pdf_url && (
                <div className="mt-6">
                  <a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 py-2.5 px-3 border border-white/[0.06] bg-white/[0.02] text-white/50 hover:text-white/80 hover:border-white/15 transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}>
                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                    <span className="text-xs tracking-wide">Download quotation (PDF)</span>
                  </a>
                </div>
              )}

              {proposal.status === "sent" && (
                <div className="mt-6 pt-5 border-t border-white/[0.08]">
                  <textarea value={proposalComment} onChange={e => setProposalComment(e.target.value)}
                    rows={3} placeholder="Add a comment (optional)"
                    className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 mb-4"
                    style={{ fontFamily: "var(--font-inter)" }} />
                  <div className="flex items-center gap-3">
                    <button onClick={() => decideProposal("approved")} disabled={deciding}
                      className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-inter)" }}>{deciding ? "Saving..." : "Approve"}</button>
                    <button onClick={() => decideProposal("rejected")} disabled={deciding}
                      className="px-5 py-2.5 border border-white/15 text-white/30 text-xs tracking-widest hover:border-white/30 transition-colors disabled:opacity-40"
                      style={{ fontFamily: "var(--font-inter)" }}>Reject</button>
                  </div>
                </div>
              )}

              {proposal.status !== "sent" && proposal.client_comment && (
                <div className="mt-6 pt-5 border-t border-white/[0.08]">
                  <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>YOUR COMMENT</p>
                  <p className="text-white/50 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{proposal.client_comment}</p>
                </div>
              )}
            </div>
          )}

          {/* Quotes */}
          {quotes.length > 0 && (
            <div className="border border-white/[0.08] bg-[#161616] p-6">
              <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>FINANCIAL OFFERS</h2>
              <div className="space-y-3">
                {quotes.map(q => (
                  <div key={q.id} className="border border-white/[0.06] bg-[#0f0f0f]">
                    <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                      className="w-full flex items-center justify-between px-5 py-4 hover:bg-white/[0.02] transition-colors">
                      <div className="text-left">
                        <p className="text-white/80 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.title}</p>
                        <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                          {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-white/70 text-sm" style={{ fontFamily: "var(--font-playfair)" }}>SAR {quoteTotal(q.lines)}</span>
                        <span className={`text-xs px-2.5 py-1 border ${q.status === "Signed" ? "border-white/20 text-white/40" : q.status === "Pending Signature" ? "border-white/50 text-white/70" : "border-white/10 text-white/20"}`}
                          style={{ fontFamily: "var(--font-inter)" }}>{q.status}</span>
                        <svg className={`w-3.5 h-3.5 text-white/30 transition-transform ${expanded === q.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </button>

                    {expanded === q.id && (
                      <div className="border-t border-white/[0.06] px-5 py-4">
                        <div className="space-y-2 mb-4">
                          {q.lines.map((l, j) => (
                            <div key={j} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                              <span className="text-white/40">{l.item}</span>
                              <span className="text-white/60">{l.amount}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm pt-3 border-t border-white/[0.08]" style={{ fontFamily: "var(--font-inter)" }}>
                            <span className="text-white/60">Total</span>
                            <span className="text-white">SAR {quoteTotal(q.lines)}</span>
                          </div>
                        </div>

                        {q.files?.length > 0 && (
                          <div className="space-y-2 mb-4">
                            {q.files.map((f, j) => (
                              <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                                <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <span className="flex-1 text-white/50 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                                <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors ml-1">
                                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        )}

                        {q.status === "Pending Signature" && (
                          <button onClick={() => signQuote(q.id)} disabled={signing === q.id}
                            className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                            style={{ fontFamily: "var(--font-inter)" }}>
                            {signing === q.id ? "Signing..." : "Sign & Approve →"}
                          </button>
                        )}
                        {q.status === "Signed" && (
                          <p className="text-white/30 text-xs flex items-center gap-2" style={{ fontFamily: "var(--font-inter)" }}>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7"/></svg>
                            Signed
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Files */}
          {files.length > 0 && (
            <div className="border border-white/[0.08] bg-[#161616] p-6">
              <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>FILES & DELIVERABLES</h2>
              <div className="space-y-0">
                {files.map((f, i) => (
                  <div key={f.id} className={`flex items-center justify-between py-3 ${i < files.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <div>
                        <p className="text-white/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</p>
                        <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                          {f.size} · {new Date(f.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors" title="Open">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                      </a>
                      <button onClick={() => downloadFile(f.url, f.name)} className="text-white/20 hover:text-white/60 transition-colors" title="Download">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="border border-white/[0.08] bg-[#161616] p-5">
            <h3 className="text-white/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>PROGRESS</h3>
            <p className="text-3xl text-white font-light mb-3" style={{ fontFamily: "var(--font-playfair)" }}>{progress}%</p>
            <div className="h-px bg-white/[0.08]">
              <div className="h-px bg-white/50 transition-all duration-500" style={{ width: `${progress}%` }} />
            </div>
            {currentStage && (
              <p className="text-white/25 text-xs mt-2" style={{ fontFamily: "var(--font-inter)" }}>Stage: {currentStage}</p>
            )}
          </div>

          {project.status && (
            <div className="border border-white/[0.08] bg-[#161616] p-5">
              <h3 className="text-white/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>STATUS</h3>
              <span className="text-xs border border-white/20 text-white/50 px-3 py-1.5 inline-block" style={{ fontFamily: "var(--font-inter)" }}>{project.status}</span>
            </div>
          )}

          {spaces.length > 0 && (
            <div className="border border-white/[0.08] bg-[#161616] p-5">
              <h3 className="text-white/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>SPACES</h3>
              <div className="space-y-0">
                {spaces.map((s, i) => (
                  <div key={s.id} className={`flex items-center justify-between py-2 ${i < spaces.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                    <span className="text-white/60 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.name}</span>
                    <span className="text-white/35 text-xs tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{Number(s.sqm).toLocaleString("en-US")} sqm</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between pt-3 mt-2 border-t border-white/[0.08]">
                <span className="text-white/40 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TOTAL</span>
                <span className="text-white/70 text-sm tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{spaces.reduce((sum, s) => sum + Number(s.sqm || 0), 0).toLocaleString("en-US")} sqm</span>
              </div>
            </div>
          )}

          {(project as any).description && (
            <div className="border border-white/[0.08] bg-[#161616] p-5">
              <h3 className="text-white/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>PROJECT INFO</h3>
              <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{(project as any).description}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
