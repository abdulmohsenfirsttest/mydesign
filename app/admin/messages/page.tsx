"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Meeting = {
  id: string; title: string; date: string; time: string; type: string;
  summary: string; decisions: string[];
  files: { name: string; size: string; url: string }[];
  status: string; client_comment: string | null; admin_reply: string | null;
  project_id: string;
};
type Project = { id: string; name: string; client_name: string; client_id: string; stage: string; progress: number };
type Milestone = { id: string; name: string; description: string | null; status: string; start_date: string | null; end_date: string | null; due_date: string | null; sort_order: number };
type Space = { id: string; name: string; sqm: number; sort_order: number };
type QuoteLine = { item: string; amount: string };
type QuoteFile = { name: string; size: string; url: string };
type Quote = { id: string; title: string; status: string; lines: QuoteLine[]; files: QuoteFile[]; created_at: string };
type Tab = "meetings" | "milestones" | "spaces" | "quotes";

const meetingTypes = ["In-Person", "Video Call", "Phone Call", "Site Visit"];
const stages = ["Quotation", "Mood Board", "2D", "3D", "Plans", "Payment", "Delivery"];
const stageProgress: Record<string, number> = { "Quotation": 14, "Mood Board": 28, "2D": 42, "3D": 57, "Plans": 71, "Payment": 85, "Delivery": 100 };
const quoteTitles = ["Quotation", "Mood Board", "2D Plans", "3D Plans", "First Payment", "Second Payment", "Final Payment", "Delivery"];
const milestoneStatuses = ["Upcoming", "In Progress", "Completed"];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function fmtDate(d: string) {
  return new Date(d + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export default function AdminProjectHub() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>("meetings");

  // Meetings
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showMeetingForm, setShowMeetingForm] = useState(false);
  const [meetingForm, setMeetingForm] = useState({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [meetingSaved, setMeetingSaved] = useState(false);
  const [replies, setReplies] = useState<Record<string, string>>({});
  const [savingReply, setSavingReply] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // Milestones
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [showMilestoneForm, setShowMilestoneForm] = useState(false);
  const [milestoneForm, setMilestoneForm] = useState({ name: "", description: "", status: "Upcoming", start_date: "", end_date: "" });
  const [milestoneError, setMilestoneError] = useState("");
  const [savingMilestone, setSavingMilestone] = useState(false);
  const [deletingMilestone, setDeletingMilestone] = useState<string | null>(null);
  const [updatingStatus, setUpdatingStatus] = useState<string | null>(null);

  // Spaces (sqm)
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [showSpaceForm, setShowSpaceForm] = useState(false);
  const [spaceForm, setSpaceForm] = useState({ name: "", sqm: "" });
  const [spaceError, setSpaceError] = useState("");
  const [savingSpace, setSavingSpace] = useState(false);
  const [deletingSpace, setDeletingSpace] = useState<string | null>(null);

  // Quotes
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [showQuoteForm, setShowQuoteForm] = useState(false);
  const [quoteTitle, setQuoteTitle] = useState(quoteTitles[0]);
  const [quoteLines, setQuoteLines] = useState<QuoteLine[]>([{ item: "", amount: "" }]);
  const [quoteFiles, setQuoteFiles] = useState<File[]>([]);
  const [quoteStatus, setQuoteStatus] = useState("Draft");
  const [savingQuote, setSavingQuote] = useState(false);
  const [deletingQuote, setDeletingQuote] = useState<string | null>(null);
  const [quoteSaved, setQuoteSaved] = useState(false);
  const quoteFileRef = useRef<HTMLInputElement>(null);

  // Stage
  const [updatingStage, setUpdatingStage] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("projects").select("id, name, stage, progress, clients(id, name)").then(({ data }) => {
      const list = ((data ?? []) as unknown as { id: string; name: string; stage: string | null; progress: number | null; clients: { id: string; name: string } | null }[]).map((p) => ({
        id: p.id, name: p.name,
        client_name: p.clients?.name ?? "—",
        client_id: p.clients?.id ?? "",
        stage: p.stage ?? "Quotation",
        progress: p.progress ?? 0,
      }));
      setProjects(list);
      if (list.length > 0) setSelectedId(list[0].id);
    });
  }, []);

  function fetchMeetings() {
    supabase.from("meetings").select("*").eq("project_id", selectedId!).order("created_at")
      .then(({ data }) => setMeetings(data ?? []));
  }
  function fetchMilestones() {
    supabase.from("milestones").select("*").eq("project_id", selectedId!).order("sort_order").order("created_at")
      .then(({ data }) => setMilestones(data ?? []));
  }
  function fetchSpaces() {
    supabase.from("spaces").select("*").eq("project_id", selectedId!).order("sort_order").order("created_at")
      // numeric(10,2) comes back as a string from PostgREST — coerce so Space.sqm is really a number.
      .then(({ data }) => setSpaces(((data as Space[]) ?? []).map(s => ({ ...s, sqm: Number(s.sqm) }))));
  }
  function fetchQuotes() {
    supabase.from("quotes").select("*").eq("project_id", selectedId!).order("created_at", { ascending: false })
      .then(({ data }) => setQuotes((data as Quote[]) ?? []));
  }

  useEffect(() => {
    if (!selectedId) return;
    fetchMeetings();
    fetchMilestones();
    fetchSpaces();
    fetchQuotes();

    const mc = supabase.channel(`hub-meetings-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "meetings", filter: `project_id=eq.${selectedId}` }, fetchMeetings)
      .subscribe();
    const mlc = supabase.channel(`hub-milestones-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "milestones", filter: `project_id=eq.${selectedId}` }, fetchMilestones)
      .subscribe();
    const sc = supabase.channel(`hub-spaces-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "spaces", filter: `project_id=eq.${selectedId}` }, fetchSpaces)
      .subscribe();
    const qc = supabase.channel(`hub-quotes-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes", filter: `project_id=eq.${selectedId}` }, fetchQuotes)
      .subscribe();

    return () => {
      supabase.removeChannel(mc);
      supabase.removeChannel(mlc);
      supabase.removeChannel(sc);
      supabase.removeChannel(qc);
    };
  }, [selectedId]);

  async function handleAddMeeting(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    const uploadedFiles: { name: string; size: string; url: string }[] = [];
    for (const file of attachedFiles) {
      const path = `${selectedId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("meetings").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("meetings").getPublicUrl(path);
        uploadedFiles.push({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, url: urlData.publicUrl });
      }
    }
    const { data } = await supabase.from("meetings").insert({
      project_id: selectedId, title: meetingForm.title, date: meetingForm.date,
      time: meetingForm.time, type: meetingForm.type, summary: meetingForm.summary,
      decisions: meetingForm.decisions.split("\n").map(d => d.trim()).filter(Boolean),
      files: uploadedFiles, status: "Pending Approval",
    }).select().single();
    if (data) setMeetings(prev => [...prev, data]);
    setMeetingForm({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
    setAttachedFiles([]);
    setUploading(false);
    setMeetingSaved(true);
    setTimeout(() => { setMeetingSaved(false); setShowMeetingForm(false); }, 1500);
  }

  async function unapprove(meetingId: string) {
    await supabase.from("meetings").update({ status: "Pending Approval" }).eq("id", meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: "Pending Approval" } : m));
  }

  async function downloadFile(url: string, name: string, bucket = "meetings") {
    const marker = `/storage/v1/object/public/${bucket}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) { window.open(url, "_blank"); return; }
    const path = decodeURIComponent(url.slice(idx + marker.length));
    const { data, error } = await supabase.storage.from(bucket).download(path);
    if (error || !data) { window.open(url, "_blank"); return; }
    const a = document.createElement("a");
    a.href = URL.createObjectURL(data);
    a.download = name;
    a.click();
    URL.revokeObjectURL(a.href);
  }

  async function submitReply(meetingId: string) {
    const text = replies[meetingId]?.trim();
    if (!text) return;
    setSavingReply(meetingId);
    await supabase.from("meetings").update({ admin_reply: text }).eq("id", meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, admin_reply: text } : m));
    setSavingReply(null);
  }

  async function handleAddMilestone(e: React.FormEvent) {
    e.preventDefault();
    // Meeting-3 rule: a milestone needs a Start and an End date, and End >= Start.
    if (milestoneForm.end_date < milestoneForm.start_date) {
      setMilestoneError("End date must be on or after the start date.");
      return;
    }
    setMilestoneError("");
    setSavingMilestone(true);
    const { data, error } = await supabase.from("milestones").insert({
      project_id: selectedId, name: milestoneForm.name,
      description: milestoneForm.description || null,
      status: milestoneForm.status,
      start_date: milestoneForm.start_date,
      end_date: milestoneForm.end_date,
      due_date: milestoneForm.end_date, // keep due_date in sync for backward-compatible displays
      sort_order: milestones.length,
    }).select().single();
    if (error) { setMilestoneError(error.message); setSavingMilestone(false); return; }
    if (data) setMilestones(prev => [...prev, data]);
    setMilestoneForm({ name: "", description: "", status: "Upcoming", start_date: "", end_date: "" });
    setSavingMilestone(false);
    setShowMilestoneForm(false);
  }

  async function updateMilestoneStatus(id: string, status: string) {
    setUpdatingStatus(id);
    await supabase.from("milestones").update({ status }).eq("id", id);
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    setUpdatingStatus(null);
  }

  async function deleteMilestone(id: string) {
    if (!confirm("Delete this milestone?")) return;
    setDeletingMilestone(id);
    await supabase.from("milestones").delete().eq("id", id);
    setMilestones(prev => prev.filter(m => m.id !== id));
    setDeletingMilestone(null);
  }

  async function handleAddSpace(e: React.FormEvent) {
    e.preventDefault();
    setSpaceError("");
    setSavingSpace(true);
    const { data, error } = await supabase.from("spaces").insert({
      project_id: selectedId, name: spaceForm.name,
      sqm: parseFloat(spaceForm.sqm) || 0,
      sort_order: spaces.length,
    }).select().single();
    if (error) { setSpaceError(error.message); setSavingSpace(false); return; }
    if (data) setSpaces(prev => [...prev, { ...(data as Space), sqm: Number((data as Space).sqm) }]);
    setSpaceForm({ name: "", sqm: "" });
    setSavingSpace(false);
    setShowSpaceForm(false);
  }

  async function deleteSpace(id: string) {
    setDeletingSpace(id);
    await supabase.from("spaces").delete().eq("id", id);
    setSpaces(prev => prev.filter(s => s.id !== id));
    setDeletingSpace(null);
  }

  const spacesTotal = spaces.reduce((sum, s) => sum + (Number(s.sqm) || 0), 0);

  async function handleAddQuote(e: React.FormEvent) {
    e.preventDefault();
    const proj = projects.find(p => p.id === selectedId);
    if (!proj) return;
    setSavingQuote(true);
    const uploadedFiles: QuoteFile[] = [];
    for (const file of quoteFiles) {
      const path = `${selectedId}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("quotes").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(path);
        uploadedFiles.push({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, url: urlData.publicUrl });
      }
    }
    const { data } = await supabase.from("quotes").insert({
      client_id: proj.client_id, project_id: selectedId, title: quoteTitle,
      status: quoteStatus, lines: quoteLines.filter(l => l.item.trim()), files: uploadedFiles,
    }).select().single();
    if (data) setQuotes(prev => [data, ...prev]);
    setQuoteLines([{ item: "", amount: "" }]);
    setQuoteFiles([]);
    setQuoteTitle(quoteTitles[0]);
    setQuoteStatus("Draft");
    setSavingQuote(false);
    setQuoteSaved(true);
    setTimeout(() => { setQuoteSaved(false); setShowQuoteForm(false); }, 1500);
  }

  async function unapproveQuote(id: string) {
    await supabase.from("quotes").update({ status: "Pending Signature" }).eq("id", id);
    setQuotes(prev => prev.map(q => q.id === id ? { ...q, status: "Pending Signature" } : q));
  }

  async function deleteQuote(id: string) {
    if (!confirm("Delete this quote?")) return;
    setDeletingQuote(id);
    await supabase.from("quotes").delete().eq("id", id);
    setQuotes(prev => prev.filter(q => q.id !== id));
    setDeletingQuote(null);
  }

  function quoteTotal(lines: QuoteLine[]) {
    return lines.reduce((sum, l) => {
      const n = parseFloat(l.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0).toLocaleString("en-SA", { minimumFractionDigits: 0 });
  }

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeletingProject(id);
    setDeleteError(null);
    await supabase.from("meetings").delete().eq("project_id", id);
    await supabase.from("milestones").delete().eq("project_id", id);
    await supabase.from("spaces").delete().eq("project_id", id); // also covered by ON DELETE CASCADE; explicit for consistency with siblings
    await supabase.from("quotes").delete().eq("project_id", id);
    await supabase.from("files").delete().eq("project_id", id);
    const { error } = await supabase.from("projects").delete().eq("id", id);
    if (error) {
      setDeleteError(error.message);
      setDeletingProject(null);
      return;
    }
    const remaining = projects.filter(p => p.id !== id);
    setProjects(remaining);
    setSelectedId(remaining.length > 0 ? remaining[0].id : null);
    setDeletingProject(null);
  }

  async function updateStage(stage: string) {
    if (!selectedId) return;
    setUpdatingStage(true);
    const progress = stageProgress[stage] ?? 0;
    await supabase.from("projects").update({ stage, progress }).eq("id", selectedId);
    setProjects(prev => prev.map(p => p.id === selectedId ? { ...p, stage, progress } : p));
    setUpdatingStage(false);
  }

  const selected = projects.find(p => p.id === selectedId);

  const milestoneStatusDot = (status: string) =>
    status === "Completed" ? "bg-white border-white" :
    status === "In Progress" ? "border-amber-400 bg-transparent" :
    "border-white/30 bg-transparent";

  return (
    <div className="flex h-screen">
      {/* Project Sidebar */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PROJECTS</h1>
          {deleteError && <p className="text-red-400/70 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{deleteError}</p>}
        </div>
        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <p className="px-5 py-4 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
          ) : projects.map(p => (
            <div key={p.id} className={`flex items-center border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selectedId === p.id ? "bg-white/[0.05]" : ""}`}>
              <button onClick={() => { setSelectedId(p.id); setMeetings([]); setMilestones([]); setSpaces([]); setQuotes([]); setShowMeetingForm(false); setShowMilestoneForm(false); setShowSpaceForm(false); setShowQuoteForm(false); setMilestoneError(""); setSpaceError(""); }}
                className="flex-1 text-left px-5 py-4">
                <p className="text-white/70 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.client_name}</p>
                <p className="text-white/25 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
              </button>
              <button onClick={() => deleteProject(p.id)} disabled={deletingProject === p.id}
                className="px-3 py-4 text-red-400/20 hover:text-red-400/70 transition-colors disabled:opacity-30" title="Delete project">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {selected ? (
          <div className="max-w-2xl p-8">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{selected.client_name}</h2>
                <p className="text-white/30 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{selected.name}</p>
              </div>
              <div className="flex-shrink-0 flex items-center gap-3">
                <select value={selected.stage ?? "Quotation"} onChange={e => updateStage(e.target.value)}
                  disabled={updatingStage}
                  className="bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2 focus:outline-none focus:border-white/40 cursor-pointer disabled:opacity-50"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {stages.map(s => <option key={s} style={{ background: "#1e1e1e" }}>{s}</option>)}
                </select>
                <span className="text-white/30 text-xs border border-white/10 px-2.5 py-2 tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>
                  {selected.progress ?? stageProgress[selected.stage] ?? 0}%
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.08] mb-8">
              {(["meetings", "milestones", "spaces", "quotes"] as Tab[]).map(tab => (
                <button key={tab} onClick={() => setActiveTab(tab)}
                  className={`px-5 py-3 text-xs tracking-widest transition-colors border-b-2 -mb-px ${activeTab === tab ? "border-white text-white" : "border-transparent text-white/30 hover:text-white/50"}`}
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {tab.toUpperCase()}
                </button>
              ))}
            </div>

            {/* ── MEETINGS ── */}
            {activeTab === "meetings" && (
              <>
                <div className="flex justify-end mb-6">
                  <button onClick={() => setShowMeetingForm(!showMeetingForm)}
                    className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}>+ Log Meeting</button>
                </div>

                {showMeetingForm && (
                  <form onSubmit={handleAddMeeting} className="border border-white/20 bg-[#161616] p-6 mb-8">
                    <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW MEETING LOG</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Meeting Title</label>
                        <input required value={meetingForm.title} onChange={e => setMeetingForm(f => ({ ...f, title: e.target.value }))}
                          placeholder="e.g. 3D Renders Review"
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Date</label>
                        <input required type="date" value={meetingForm.date} onChange={e => setMeetingForm(f => ({ ...f, date: e.target.value }))}
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Time</label>
                        <input required type="time" value={meetingForm.time} onChange={e => setMeetingForm(f => ({ ...f, time: e.target.value }))}
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                      </div>
                      <div className="col-span-2">
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Meeting Type</label>
                        <select value={meetingForm.type} onChange={e => setMeetingForm(f => ({ ...f, type: e.target.value }))}
                          className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          {meetingTypes.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Summary</label>
                      <textarea required rows={4} value={meetingForm.summary} onChange={e => setMeetingForm(f => ({ ...f, summary: e.target.value }))}
                        placeholder="What was discussed..."
                        className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                        style={{ fontFamily: "var(--font-inter)" }} />
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Decisions <span className="text-white/15 normal-case tracking-normal">(one per line)</span></label>
                      <textarea rows={3} value={meetingForm.decisions} onChange={e => setMeetingForm(f => ({ ...f, decisions: e.target.value }))}
                        placeholder={"Client approved kitchen layout\nMarble samples to be presented next week"}
                        className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                        style={{ fontFamily: "var(--font-inter)" }} />
                    </div>
                    <div className="mb-5">
                      <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setAttachedFiles(Array.from(e.target.files ?? []))} />
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="text-xs border border-white/15 text-white/30 px-4 py-2 hover:border-white/30 hover:text-white/50 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Attach files</button>
                      {attachedFiles.map((f, i) => (
                        <p key={i} className="text-white/30 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>↳ {f.name}</p>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={uploading}
                        className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {uploading ? "Uploading..." : meetingSaved ? "✓ Saved" : "Save & Send to Client"}
                      </button>
                      <button type="button" onClick={() => setShowMeetingForm(false)}
                        className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
                    </div>
                  </form>
                )}

                {meetings.length === 0 ? (
                  <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                    <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No meetings logged yet.</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {meetings.map((m, i) => (
                      <div key={m.id} className="flex gap-5">
                        <div className="flex flex-col items-center flex-shrink-0 w-5">
                          <div className={`w-3 h-3 rounded-full mt-1 border-2 ${m.status === "Approved" ? "bg-white border-white" : "border-white/40 bg-transparent"}`} />
                          {i < meetings.length - 1 && <div className="w-px flex-1 mt-2 bg-white/10" style={{ minHeight: "32px" }} />}
                        </div>
                        <div className={`flex-1 mb-8 border ${m.status !== "Approved" ? "border-white/20" : "border-white/[0.08]"} bg-[#161616] p-6`}>
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <div>
                              <h3 className="text-white text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.title}</h3>
                              <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m.date} · {m.time} · {m.type}</p>
                            </div>
                            {m.status === "Approved" ? (
                              <div className="flex items-center gap-2 flex-shrink-0">
                                <span className="flex items-center gap-1.5 text-white/40 text-xs border border-white/10 px-2.5 py-1" style={{ fontFamily: "var(--font-inter)" }}>
                                  <CheckIcon /> Client approved
                                </span>
                                <button onClick={() => unapprove(m.id)}
                                  className="text-white/20 text-xs border border-white/10 px-2.5 py-1 hover:border-white/30 hover:text-white/50 transition-colors"
                                  style={{ fontFamily: "var(--font-inter)" }}>Unapprove</button>
                              </div>
                            ) : (
                              <span className="text-amber-400/60 text-xs border border-amber-400/20 px-2.5 py-1 flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>Awaiting approval</span>
                            )}
                          </div>
                          {m.summary && <p className="text-white/50 text-xs leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>{m.summary}</p>}
                          {m.decisions?.length > 0 && (
                            <ul className="space-y-1.5 mb-4">
                              {m.decisions.map((d, j) => (
                                <li key={j} className="flex items-start gap-2 text-xs text-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                                  <span className="text-white/20 flex-shrink-0">—</span>{d}
                                </li>
                              ))}
                            </ul>
                          )}
                          {m.files?.length > 0 && (
                            <div className="space-y-2 mb-4">
                              <p className="text-white/20 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>FILES</p>
                              {m.files.map((f, j) => (
                                <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                                  <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                  <span className="flex-1 text-white/50 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                                  <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                                  <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors ml-1">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                  </a>
                                  <button onClick={() => downloadFile(f.url, f.name)} className="text-white/20 hover:text-white/60 transition-colors">
                                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                          {m.client_comment && (
                            <div className="mt-3 pt-3 border-t border-white/[0.06]">
                              <p className="text-white/20 text-xs tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>CLIENT COMMENT</p>
                              <p className="text-white/50 text-xs leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>{m.client_comment}</p>
                              {m.admin_reply ? (
                                <div className="bg-white/[0.03] border border-white/[0.06] px-4 py-3 mb-3">
                                  <p className="text-white/20 text-xs tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>YOUR REPLY</p>
                                  <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{m.admin_reply}</p>
                                  <button onClick={() => setReplies(r => ({ ...r, [m.id]: m.admin_reply ?? "" }))}
                                    className="text-white/20 text-xs hover:text-white/40 transition-colors mt-2"
                                    style={{ fontFamily: "var(--font-inter)" }}>Edit reply</button>
                                </div>
                              ) : null}
                              {(!m.admin_reply || replies[m.id] !== undefined) && (
                                <div>
                                  <textarea value={replies[m.id] ?? ""} onChange={e => setReplies(r => ({ ...r, [m.id]: e.target.value }))}
                                    placeholder="Write a reply to the client..." rows={2}
                                    className="w-full bg-transparent border border-white/10 text-white/60 text-xs px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder-white/20 resize-none mb-2"
                                    style={{ fontFamily: "var(--font-inter)" }} />
                                  <button onClick={() => submitReply(m.id)} disabled={savingReply === m.id || !replies[m.id]?.trim()}
                                    className="px-4 py-2 border border-white/20 text-white/50 text-xs hover:border-white/50 hover:text-white/70 transition-colors disabled:opacity-30"
                                    style={{ fontFamily: "var(--font-inter)" }}>
                                    {savingReply === m.id ? "Sending..." : "Send Reply"}
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── MILESTONES ── */}
            {activeTab === "milestones" && (
              <>
                <div className="flex justify-end mb-6">
                  <button onClick={() => { setShowMilestoneForm(!showMilestoneForm); setMilestoneError(""); }}
                    className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}>+ Add Milestone</button>
                </div>

                {showMilestoneForm && (
                  <form onSubmit={handleAddMilestone} className="border border-white/20 bg-[#161616] p-6 mb-8">
                    <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW MILESTONE</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Name</label>
                        <input required value={milestoneForm.name} onChange={e => setMilestoneForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. 3D Renders Approved"
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Description <span className="text-white/15 normal-case tracking-normal">(optional)</span></label>
                        <input value={milestoneForm.description} onChange={e => setMilestoneForm(f => ({ ...f, description: e.target.value }))}
                          placeholder="Brief note..."
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Start Date</label>
                          <input type="date" required value={milestoneForm.start_date} onChange={e => setMilestoneForm(f => ({ ...f, start_date: e.target.value }))}
                            className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                            style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                        </div>
                        <div>
                          <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>End Date</label>
                          <input type="date" required value={milestoneForm.end_date} onChange={e => setMilestoneForm(f => ({ ...f, end_date: e.target.value }))}
                            className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                            style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Status</label>
                        <select value={milestoneForm.status} onChange={e => setMilestoneForm(f => ({ ...f, status: e.target.value }))}
                          className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          {milestoneStatuses.map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                    </div>
                    {milestoneError && <p className="text-red-400/70 text-xs mt-4" style={{ fontFamily: "var(--font-inter)" }}>{milestoneError}</p>}
                    <div className="flex gap-3 mt-5">
                      <button type="submit" disabled={savingMilestone}
                        className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {savingMilestone ? "Saving..." : "Add Milestone"}
                      </button>
                      <button type="button" onClick={() => { setShowMilestoneForm(false); setMilestoneError(""); }}
                        className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
                    </div>
                  </form>
                )}

                {milestones.length === 0 ? (
                  <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                    <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No milestones yet.</p>
                  </div>
                ) : (
                  <div className="space-y-0">
                    {milestones.map((m, i) => (
                      <div key={m.id} className="flex gap-5">
                        <div className="flex flex-col items-center flex-shrink-0 w-5">
                          <div className={`w-3 h-3 rounded-full mt-1 border-2 ${milestoneStatusDot(m.status)}`} />
                          {i < milestones.length - 1 && <div className="w-px flex-1 mt-2 bg-white/10" style={{ minHeight: "32px" }} />}
                        </div>
                        <div className="flex-1 mb-6 border border-white/[0.08] bg-[#161616] p-5">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="text-white/80 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{m.name}</p>
                              {m.description && <p className="text-white/30 text-xs mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.description}</p>}
                              {(m.start_date && m.end_date)
                                ? <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{fmtDate(m.start_date)} – {fmtDate(m.end_date)}</p>
                                : m.due_date ? <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{fmtDate(m.due_date)}</p> : null}
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <select value={m.status} onChange={e => updateMilestoneStatus(m.id, e.target.value)}
                                disabled={updatingStatus === m.id}
                                className={`bg-transparent border text-xs px-2 py-1 focus:outline-none cursor-pointer ${m.status === "Completed" ? "border-white/20 text-white/40" : m.status === "In Progress" ? "border-amber-400/30 text-amber-400/60" : "border-white/10 text-white/20"}`}
                                style={{ fontFamily: "var(--font-inter)" }}>
                                {milestoneStatuses.map(s => <option key={s} style={{ background: "#161616" }}>{s}</option>)}
                              </select>
                              <button onClick={() => deleteMilestone(m.id)} disabled={deletingMilestone === m.id}
                                className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ── SPACES ── */}
            {activeTab === "spaces" && (
              <>
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <p className="text-white/40 text-xs tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>TOTAL AREA</p>
                    <p className="text-white text-lg tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{spacesTotal.toLocaleString("en-US")} <span className="text-white/30 text-sm">sqm</span></p>
                  </div>
                  <button onClick={() => { setShowSpaceForm(!showSpaceForm); setSpaceError(""); }}
                    className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}>+ Add Space</button>
                </div>

                {showSpaceForm && (
                  <form onSubmit={handleAddSpace} className="border border-white/20 bg-[#161616] p-6 mb-8">
                    <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW SPACE</h3>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="col-span-2">
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Space / Room</label>
                        <input required value={spaceForm.name} onChange={e => setSpaceForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="e.g. Majlis, Kitchen, Exterior façade"
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Size (sqm)</label>
                        <input required type="number" min="0" step="0.01" value={spaceForm.sqm} onChange={e => setSpaceForm(f => ({ ...f, sqm: e.target.value }))}
                          placeholder="0"
                          className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                    </div>
                    {spaceError && <p className="text-red-400/70 text-xs mt-4" style={{ fontFamily: "var(--font-inter)" }}>{spaceError}</p>}
                    <div className="flex gap-3 mt-5">
                      <button type="submit" disabled={savingSpace}
                        className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {savingSpace ? "Saving..." : "Add Space"}
                      </button>
                      <button type="button" onClick={() => { setShowSpaceForm(false); setSpaceError(""); }}
                        className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
                    </div>
                  </form>
                )}

                {spaces.length === 0 ? (
                  <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                    <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No spaces recorded yet. Add the rooms / areas and their square meters.</p>
                  </div>
                ) : (
                  <div className="border border-white/[0.08] bg-[#161616]">
                    {spaces.map((s, i) => (
                      <div key={s.id} className={`flex items-center justify-between px-5 py-3.5 ${i < spaces.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                        <span className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{s.name}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-white/50 text-sm tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{Number(s.sqm).toLocaleString("en-US")} sqm</span>
                          <button onClick={() => deleteSpace(s.id)} disabled={deletingSpace === s.id}
                            className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="flex items-center justify-between px-5 py-3.5 border-t border-white/[0.12]">
                      <span className="text-white/40 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TOTAL</span>
                      <span className="text-white text-sm tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>{spacesTotal.toLocaleString("en-US")} sqm</span>
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ── QUOTES ── */}
            {activeTab === "quotes" && (
              <>
                <div className="flex justify-end mb-6">
                  <button onClick={() => setShowQuoteForm(!showQuoteForm)}
                    className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                    style={{ fontFamily: "var(--font-inter)" }}>+ New Quote</button>
                </div>

                {showQuoteForm && (
                  <form onSubmit={handleAddQuote} className="border border-white/20 bg-[#161616] p-6 mb-8">
                    <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW QUOTE</h3>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Title</label>
                        <select value={quoteTitle} onChange={e => setQuoteTitle(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          {quoteTitles.map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Status</label>
                        <select value={quoteStatus} onChange={e => setQuoteStatus(e.target.value)}
                          className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          <option>Draft</option>
                          <option>Pending Signature</option>
                        </select>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs text-white/30 mb-2 tracking-widests" style={{ fontFamily: "var(--font-inter)" }}>Line Items</label>
                      <div className="space-y-2">
                        {quoteLines.map((line, idx) => (
                          <div key={idx} className="flex gap-2 items-center">
                            <input value={line.item} onChange={e => setQuoteLines(ls => ls.map((l, i) => i === idx ? { ...l, item: e.target.value } : l))}
                              placeholder="Item description"
                              className="flex-1 bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2 focus:outline-none focus:border-white/40 placeholder-white/20"
                              style={{ fontFamily: "var(--font-inter)" }} />
                            <input value={line.amount} onChange={e => setQuoteLines(ls => ls.map((l, i) => i === idx ? { ...l, amount: e.target.value } : l))}
                              placeholder="SAR 0"
                              className="w-28 bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2 focus:outline-none focus:border-white/40 placeholder-white/20"
                              style={{ fontFamily: "var(--font-inter)" }} />
                            {quoteLines.length > 1 && (
                              <button type="button" onClick={() => setQuoteLines(ls => ls.filter((_, i) => i !== idx))}
                                className="text-white/20 hover:text-red-400/60 transition-colors text-lg leading-none px-1">×</button>
                            )}
                          </div>
                        ))}
                        <button type="button" onClick={() => setQuoteLines(ls => [...ls, { item: "", amount: "" }])}
                          className="text-xs text-white/30 hover:text-white/50 transition-colors mt-1"
                          style={{ fontFamily: "var(--font-inter)" }}>+ Add item</button>
                      </div>
                    </div>
                    <div className="mb-5">
                      <input ref={quoteFileRef} type="file" multiple className="hidden" onChange={e => setQuoteFiles(Array.from(e.target.files ?? []))} />
                      <button type="button" onClick={() => quoteFileRef.current?.click()}
                        className="text-xs border border-white/15 text-white/30 px-4 py-2 hover:border-white/30 hover:text-white/50 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Attach files</button>
                      {quoteFiles.map((f, i) => (
                        <p key={i} className="text-white/30 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>↳ {f.name}</p>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <button type="submit" disabled={savingQuote}
                        className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {savingQuote ? "Saving..." : quoteSaved ? "✓ Saved" : "Save & Send to Client"}
                      </button>
                      <button type="button" onClick={() => setShowQuoteForm(false)}
                        className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
                        style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
                    </div>
                  </form>
                )}

                {quotes.length === 0 ? (
                  <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                    <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No quotes yet.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {quotes.map(q => (
                      <div key={q.id} className="border border-white/[0.08] bg-[#161616] p-5">
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div>
                            <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.title}</p>
                            <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                          </div>
                          <div className="flex items-center gap-2 flex-shrink-0">
                            <span className={`text-xs px-2.5 py-1 border ${q.status === "Signed" ? "border-white/20 text-white/40" : q.status === "Pending Signature" ? "border-white/50 text-white/70" : "border-white/10 text-white/20"}`}
                              style={{ fontFamily: "var(--font-inter)" }}>{q.status}</span>
                            {q.status === "Signed" && (
                              <button onClick={() => unapproveQuote(q.id)}
                                className="text-xs border border-white/10 text-white/20 px-2.5 py-1 hover:border-white/30 hover:text-white/50 transition-colors"
                                style={{ fontFamily: "var(--font-inter)" }}>Unapprove</button>
                            )}
                            <button onClick={() => deleteQuote(q.id)} disabled={deletingQuote === q.id}
                              className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                        </div>
                        <div className="space-y-1.5 mb-3">
                          {q.lines.map((l, j) => (
                            <div key={j} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                              <span className="text-white/40">{l.item}</span>
                              <span className="text-white/60">{l.amount}</span>
                            </div>
                          ))}
                          <div className="flex justify-between text-sm pt-2 border-t border-white/[0.08] mt-2" style={{ fontFamily: "var(--font-inter)" }}>
                            <span className="text-white/50">Total</span>
                            <span className="text-white">SAR {quoteTotal(q.lines)}</span>
                          </div>
                        </div>
                        {q.files?.length > 0 && (
                          <div className="space-y-1.5">
                            {q.files.map((f, j) => (
                              <div key={j} className="flex items-center gap-2 py-1.5 px-3 border border-white/[0.06] bg-white/[0.02]">
                                <svg className="w-3 h-3 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                <span className="flex-1 text-white/40 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                                <span className="text-white/15 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                                <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors ml-1">
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                </a>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
