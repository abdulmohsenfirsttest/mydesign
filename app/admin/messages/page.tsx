"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { getAdmin } from "@/lib/roles";

type Meeting = {
  id: string; title: string; date: string; time: string; type: string;
  summary: string; decisions: string[];
  files: { name: string; size: string; url: string }[];
  status: string; client_comment: string | null; admin_reply: string | null;
  project_id: string;
};
type Project = { id: string; name: string; client_name: string; client_id: string; stage: string; progress: number };
type Milestone = { id: string; name: string; description: string | null; status: string; start_date: string | null; end_date: string | null; due_date: string | null; sort_order: number; files: { name: string; size: string; url: string }[]; bundle: string | null };
type Space = { id: string; name: string; sqm: number; sort_order: number };
type QuoteLine = { item: string; amount: string };
type QuoteFile = { name: string; size: string; url: string };
type Quote = { id: string; title: string; status: string; lines: QuoteLine[]; files: QuoteFile[]; created_at: string };
type InternalQuote = { id: string; project_id: string; sqm_total: number; price_per_sqm: number | null; total: number | null; status: string; requested_by: string | null; approved_by: string | null; created_at: string; approved_at: string | null };
type Proposal = { id: string; project_id: string; scope: string | null; stages: string | null; pricing: string | null; terms: string | null; status: string; client_comment: string | null; sent_at: string | null; decided_at: string | null; created_at: string; pdf_url: string | null };
type Tab = "meetings" | "milestones" | "spaces" | "proposal" | "quotes";
type ProjectNote = { id: string; author_name: string | null; body: string; created_at: string };

const meetingTypes = ["In-Person", "Video Call", "Phone Call", "Site Visit"];
const stages = ["Quotation", "Mood Board", "2D", "3D", "Plans", "Payment", "Delivery"];
const stageProgress: Record<string, number> = { "Quotation": 14, "Mood Board": 28, "2D": 42, "3D": 57, "Plans": 71, "Payment": 85, "Delivery": 100 };
const quoteTitles = ["Quotation", "Mood Board", "2D Plans", "3D Plans", "First Payment", "Second Payment", "Final Payment", "Delivery"];
const milestoneStatuses = ["Upcoming", "In Progress", "Completed", "Skipped"];

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

  // Internal quote (staff-only pricing from the Manager)
  const [internalQuote, setInternalQuote] = useState<InternalQuote | null>(null);
  const [requestingPricing, setRequestingPricing] = useState(false);
  const [pricingError, setPricingError] = useState("");

  // Proposal builder
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [proposalForm, setProposalForm] = useState({ scope: "", stages: "", pricing: "", terms: "" });
  // Internal notes (staff-only) shown beside the proposal — never seen by the client.
  const [notes, setNotes] = useState<ProjectNote[]>([]);
  const [noteBody, setNoteBody] = useState("");
  const [savingNote, setSavingNote] = useState(false);
  const [noteError, setNoteError] = useState("");
  const [savingProposal, setSavingProposal] = useState(false);
  const [proposalError, setProposalError] = useState("");
  const [proposalSaved, setProposalSaved] = useState(false);

  // Milestone deliverables
  const [uploadingMilestone, setUploadingMilestone] = useState<string | null>(null);
  const [milestoneUploadError, setMilestoneUploadError] = useState<Record<string, string>>({});

  // Stage
  const [updatingStage, setUpdatingStage] = useState(false);
  const [deletingProject, setDeletingProject] = useState<string | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  useEffect(() => {
    const me = getAdmin();
    supabase.from("projects").select("id, name, stage, progress, track, designer_id, pm_id, clients(id, name)").then(({ data }) => {
      const rows = ((data ?? []) as unknown as { id: string; name: string; stage: string | null; progress: number | null; track: string | null; designer_id: string | null; pm_id: string | null; clients: { id: string; name: string } | null }[]);
      // Role-scope the hub the same way the projects list does: a designer sees only
      // their assigned projects, a project_manager the management track, a manager all.
      const visible = rows.filter((p) => {
        if (!me || me.role === "manager") return true;
        if (me.role === "designer") return p.designer_id === me.id;
        if (me.role === "project_manager") return p.track === "management" || p.pm_id === me.id;
        return true;
      });
      const list = visible.map((p) => ({
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
  function fetchInternalQuote() {
    supabase.from("internal_quotes").select("*").eq("project_id", selectedId!).order("created_at", { ascending: false }).limit(1)
      // numeric columns come back from PostgREST as strings — coerce the pricing fields to real numbers.
      .then(({ data }) => {
        const q = (data as InternalQuote[] | null)?.[0] ?? null;
        setInternalQuote(q ? { ...q, sqm_total: Number(q.sqm_total), price_per_sqm: q.price_per_sqm == null ? null : Number(q.price_per_sqm), total: q.total == null ? null : Number(q.total) } : null);
      });
  }
  function fetchProposal() {
    supabase.from("proposals").select("*").eq("project_id", selectedId!).order("created_at", { ascending: false }).limit(1)
      .then(({ data }) => setProposal((data as Proposal[] | null)?.[0] ?? null));
  }
  function fetchNotes() {
    supabase.from("project_notes").select("*").eq("project_id", selectedId!).order("created_at", { ascending: false })
      .then(({ data }) => setNotes((data as ProjectNote[]) ?? []));
  }

  useEffect(() => {
    if (!selectedId) return;
    fetchMeetings();
    fetchMilestones();
    fetchSpaces();
    fetchQuotes();
    fetchInternalQuote();
    fetchProposal();
    fetchNotes();

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
    const iqc = supabase.channel(`hub-internal-quotes-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "internal_quotes", filter: `project_id=eq.${selectedId}` }, fetchInternalQuote)
      .subscribe();
    const pc = supabase.channel(`hub-proposals-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "proposals", filter: `project_id=eq.${selectedId}` }, fetchProposal)
      .subscribe();
    const nc = supabase.channel(`hub-notes-${selectedId}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "project_notes", filter: `project_id=eq.${selectedId}` }, fetchNotes)
      .subscribe();

    return () => {
      supabase.removeChannel(mc);
      supabase.removeChannel(mlc);
      supabase.removeChannel(sc);
      supabase.removeChannel(qc);
      supabase.removeChannel(iqc);
      supabase.removeChannel(pc);
      supabase.removeChannel(nc);
    };
  }, [selectedId]);

  // Keep the proposal builder textareas in sync with the loaded proposal (per project).
  useEffect(() => {
    setProposalForm({
      scope: proposal?.scope ?? "",
      stages: proposal?.stages ?? "",
      pricing: proposal?.pricing ?? "",
      terms: proposal?.terms ?? "",
    });
  }, [proposal, selectedId]);

  async function handleAddNote(e: React.FormEvent) {
    e.preventDefault();
    const body = noteBody.trim();
    if (!body || !selectedId) return;
    setNoteError("");
    setSavingNote(true);
    const me = getAdmin();
    const { error } = await supabase.from("project_notes").insert({
      project_id: selectedId, author_id: me?.id ?? null, author_name: me?.name ?? null, body,
    });
    setSavingNote(false);
    if (error) { setNoteError(error.message); return; }
    setNoteBody("");
    fetchNotes();
  }

  async function deleteNote(noteId: string) {
    await supabase.from("project_notes").delete().eq("id", noteId);
    setNotes(prev => prev.filter(n => n.id !== noteId));
  }

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
    // Delivery rule: a milestone can't be created as Completed — it has no deliverable yet.
    if (milestoneForm.status === "Completed") {
      setMilestoneError("A new milestone can't start as Completed — create it, attach a deliverable, then mark it Completed.");
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
    const ms = milestones.find(x => x.id === id);
    // Meeting-3 delivery rule: a milestone cannot be marked Completed without at least one deliverable.
    if (status === "Completed" && !((ms?.files ?? []).length > 0)) {
      setMilestoneUploadError(e => ({ ...e, [id]: "Attach at least one deliverable before marking this milestone Completed." }));
      return;
    }
    setUpdatingStatus(id);
    const { error } = await supabase.from("milestones").update({ status }).eq("id", id);
    if (error) { setMilestoneUploadError(e => ({ ...e, [id]: error.message })); setUpdatingStatus(null); return; }
    setMilestones(prev => prev.map(m => m.id === id ? { ...m, status } : m));
    setUpdatingStatus(null);
  }

  async function handleMilestoneUpload(m: Milestone, file: File) {
    setMilestoneUploadError(e => ({ ...e, [m.id]: "" }));
    setUploadingMilestone(m.id);
    const path = `${selectedId}/${Date.now()}-${file.name}`;
    const { error: upErr } = await supabase.storage.from("files").upload(path, file);
    if (upErr) { setMilestoneUploadError(e => ({ ...e, [m.id]: upErr.message })); setUploadingMilestone(null); return; }
    const { data: urlData } = supabase.storage.from("files").getPublicUrl(path);
    const nextFiles = [...(m.files ?? []), { name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, url: urlData.publicUrl }];
    const { error } = await supabase.from("milestones").update({ files: nextFiles }).eq("id", m.id);
    if (error) { setMilestoneUploadError(e => ({ ...e, [m.id]: error.message })); setUploadingMilestone(null); return; }
    setMilestones(prev => prev.map(x => x.id === m.id ? { ...x, files: nextFiles } : x));
    setUploadingMilestone(null);
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

  async function requestPricing() {
    if (!selectedId || internalQuote) return;
    setPricingError("");
    setRequestingPricing(true);
    const { data, error } = await supabase.from("internal_quotes").insert({
      project_id: selectedId, sqm_total: spacesTotal, status: "pending", requested_by: getAdmin()?.id ?? null,
    }).select().single();
    if (error) { setPricingError(error.message); setRequestingPricing(false); return; }
    if (data) {
      const q = data as InternalQuote;
      setInternalQuote({ ...q, sqm_total: Number(q.sqm_total), price_per_sqm: q.price_per_sqm == null ? null : Number(q.price_per_sqm), total: q.total == null ? null : Number(q.total) });
    }
    setRequestingPricing(false);
  }

  async function saveProposal(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedId) return;
    setProposalError("");
    setSavingProposal(true);

    // Generate a quotation PDF (subtotal + 15% VAT) and upload it before writing the proposal row.
    let pdfUrl: string | null = null;
    try {
      const { default: jsPDF } = await import("jspdf");
      const proj = projects.find(p => p.id === selectedId);
      const doc = new jsPDF();
      const marginX = 20;
      let y = 24;
      doc.setFontSize(20);
      doc.text("QUOTATION", marginX, y);
      y += 12;
      doc.setFontSize(11);
      doc.text(`Client: ${proj?.client_name ?? "—"}`, marginX, y); y += 7;
      doc.text(`Project: ${proj?.name ?? "—"}`, marginX, y); y += 12;

      const section = (title: string, body: string) => {
        doc.setFontSize(12);
        doc.text(title, marginX, y); y += 7;
        doc.setFontSize(10);
        const lines = doc.splitTextToSize(body || "—", 170);
        doc.text(lines, marginX, y);
        y += lines.length * 5 + 8;
      };
      section("Scope of Work", proposalForm.scope);
      section("Stages of Work", proposalForm.stages);
      section("Terms & Conditions", proposalForm.terms);

      const subtotal = parseFloat(String(proposalForm.pricing).replace(/[^0-9.]/g, "")) || 0;
      const vat = subtotal * 0.15;
      const total = subtotal + vat;
      doc.setFontSize(12);
      doc.text("Pricing", marginX, y); y += 7;
      doc.setFontSize(10);
      doc.text(`Subtotal: SAR ${subtotal.toLocaleString("en-US")}`, marginX, y); y += 6;
      doc.text(`VAT (15%): SAR ${vat.toLocaleString("en-US")}`, marginX, y); y += 6;
      doc.text(`Total: SAR ${total.toLocaleString("en-US")}`, marginX, y);

      const blob = doc.output("blob");
      const path = `${selectedId}/proposal-${Date.now()}.pdf`;
      const { error: upErr } = await supabase.storage.from("quotes").upload(path, blob, { contentType: "application/pdf", upsert: true });
      if (upErr) { setProposalError(upErr.message); setSavingProposal(false); return; }
      const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(path);
      pdfUrl = urlData.publicUrl;
    } catch (err) {
      setProposalError(err instanceof Error ? err.message : "Failed to generate quotation PDF.");
      setSavingProposal(false);
      return;
    }

    const payload = {
      scope: proposalForm.scope || null,
      stages: proposalForm.stages || null,
      pricing: proposalForm.pricing || null,
      terms: proposalForm.terms || null,
      status: "sent",
      sent_at: new Date().toISOString(),
      pdf_url: pdfUrl,
    };
    const res = proposal
      ? await supabase.from("proposals").update(payload).eq("id", proposal.id).select().single()
      : await supabase.from("proposals").insert({ project_id: selectedId, ...payload }).select().single();
    if (res.error) { setProposalError(res.error.message); setSavingProposal(false); return; }
    if (res.data) setProposal(res.data as Proposal);
    setSavingProposal(false);
    setProposalSaved(true);
    setTimeout(() => setProposalSaved(false), 1500);
  }

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
  const quoteApproved = internalQuote?.status === "approved";
  const proposalEditable = !proposal || proposal.status === "draft" || proposal.status === "rejected";

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
              <button onClick={() => { setSelectedId(p.id); setMeetings([]); setMilestones([]); setSpaces([]); setQuotes([]); setInternalQuote(null); setProposal(null); setShowMeetingForm(false); setShowMilestoneForm(false); setShowSpaceForm(false); setShowQuoteForm(false); setMilestoneError(""); setSpaceError(""); setPricingError(""); setProposalError(""); setMilestoneUploadError({}); }}
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
                <span className="text-white/50 text-xs border border-white/15 px-2.5 py-2" style={{ fontFamily: "var(--font-inter)" }}>{selected.stage ?? "Quotation"}</span>
                <span className="text-white/30 text-xs border border-white/10 px-2.5 py-2 tabular-nums" style={{ fontFamily: "var(--font-inter)" }}>
                  {selected.progress ?? stageProgress[selected.stage] ?? 0}%
                </span>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/[0.08] mb-8">
              {(["meetings", "milestones", "spaces", "proposal"] as Tab[]).map(tab => (
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
                          <div className="mb-3">
                            <h3 className="text-white text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.title}</h3>
                            <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m.date} · {m.time} · {m.type}</p>
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
                              <div className="flex items-center gap-2 mb-0.5">
                                <p className={`text-sm ${m.status === "Skipped" ? "text-white/25" : "text-white/80"}`} style={{ fontFamily: "var(--font-inter)" }}>{m.name}</p>
                                {(m.name === "Mood Board" || m.name === "2D") && (
                                  <span className="text-[10px] tracking-widest text-amber-400/60 border border-amber-400/20 px-1.5 py-0.5" style={{ fontFamily: "var(--font-inter)" }}>DELIVERED TOGETHER</span>
                                )}
                                {m.status === "Skipped" && (
                                  <span className="text-[10px] tracking-widest text-white/25 border border-white/10 px-1.5 py-0.5" style={{ fontFamily: "var(--font-inter)" }}>Skipped</span>
                                )}
                              </div>
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
                                {milestoneStatuses.map(s => <option key={s} disabled={s === "Completed" && (m.files ?? []).length === 0} style={{ background: "#161616" }}>{s}</option>)}
                              </select>
                              <button onClick={() => deleteMilestone(m.id)} disabled={deletingMilestone === m.id}
                                className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                              </button>
                            </div>
                          </div>
                          {/* Deliverables — required before a milestone can be marked Completed (Meeting-3 delivery rule). */}
                          <div className="mt-4 pt-4 border-t border-white/[0.06]">
                            <p className="text-white/20 text-xs tracking-widest mb-2" style={{ fontFamily: "var(--font-inter)" }}>DELIVERABLES</p>
                            {(m.files ?? []).length > 0 ? (
                              <div className="space-y-2 mb-3">
                                {(m.files ?? []).map((f, j) => (
                                  <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                                    <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                                    <span className="flex-1 text-white/50 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                                    <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                                    <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors ml-1">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                                    </a>
                                    <button onClick={() => downloadFile(f.url, f.name, "files")} className="text-white/20 hover:text-white/60 transition-colors">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                                    </button>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-white/20 text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>No deliverable attached yet — required before this milestone can be marked Completed.</p>
                            )}
                            <label className="inline-block text-xs border border-white/15 text-white/30 px-4 py-2 hover:border-white/30 hover:text-white/50 transition-colors cursor-pointer" style={{ fontFamily: "var(--font-inter)" }}>
                              {uploadingMilestone === m.id ? "Uploading..." : "Attach deliverable"}
                              <input type="file" className="hidden" disabled={uploadingMilestone === m.id}
                                onChange={e => { const file = e.target.files?.[0]; if (file) handleMilestoneUpload(m, file); e.target.value = ""; }} />
                            </label>
                            {milestoneUploadError[m.id] && <p className="text-red-400/70 text-xs mt-2" style={{ fontFamily: "var(--font-inter)" }}>{milestoneUploadError[m.id]}</p>}
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

                {/* Request internal pricing from the Manager (staff-only price stays inside the hub). */}
                <div className="mt-6 border border-white/[0.08] bg-[#161616] p-6">
                  <p className="text-xs text-white/30 mb-3 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>INTERNAL PRICING</p>
                  {!internalQuote ? (
                    <>
                      <button type="button" onClick={requestPricing} disabled={requestingPricing || spaces.length === 0}
                        className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {requestingPricing ? "Requesting..." : "Request pricing from Manager"}
                      </button>
                      {spaces.length === 0 && <p className="text-white/20 text-xs mt-2" style={{ fontFamily: "var(--font-inter)" }}>Add at least one space first.</p>}
                      {pricingError && <p className="text-red-400/70 text-xs mt-2" style={{ fontFamily: "var(--font-inter)" }}>{pricingError}</p>}
                    </>
                  ) : internalQuote.status === "approved" ? (
                    <p className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Priced: SAR {Number(internalQuote.price_per_sqm).toLocaleString("en-US")}/sqm → SAR {Number(internalQuote.total).toLocaleString("en-US")}</p>
                  ) : (
                    <p className="text-amber-400/60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Pending manager pricing</p>
                  )}
                </div>
              </>
            )}

            {/* ── PROPOSAL ── */}
            {activeTab === "proposal" && (
              <>
                {/* Manager pricing gate — the proposal cannot be sent until the internal quote is approved. */}
                <div className="border border-white/[0.08] bg-[#161616] p-5 mb-6">
                  <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MANAGER PRICING</p>
                  {!internalQuote ? (
                    <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No pricing requested yet. Request pricing from the Spaces tab first.</p>
                  ) : internalQuote.status === "approved" ? (
                    <p className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Approved · SAR {Number(internalQuote.price_per_sqm).toLocaleString("en-US")}/sqm → SAR {Number(internalQuote.total).toLocaleString("en-US")}</p>
                  ) : (
                    <p className="text-amber-400/60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Pending manager pricing</p>
                  )}
                </div>

                {proposal && (
                  <div className="border border-white/[0.08] bg-[#161616] p-5 mb-6">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-white/40 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PROPOSAL STATUS</p>
                      <span className={`text-xs px-2.5 py-1 border ${proposal.status === "approved" ? "border-white/50 text-white/70" : proposal.status === "rejected" ? "border-red-400/30 text-red-400/60" : proposal.status === "sent" ? "border-amber-400/30 text-amber-400/60" : "border-white/10 text-white/20"}`}
                        style={{ fontFamily: "var(--font-inter)" }}>{proposal.status.toUpperCase()}</span>
                    </div>
                    {proposal.sent_at && <p className="text-white/25 text-xs mt-2" style={{ fontFamily: "var(--font-inter)" }}>Sent {new Date(proposal.sent_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                    {(proposal.status === "approved" || proposal.status === "rejected") && (
                      <div className="mt-3 pt-3 border-t border-white/[0.06]">
                        {proposal.client_comment && (
                          <>
                            <p className="text-white/20 text-xs tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>CLIENT COMMENT</p>
                            <p className="text-white/50 text-xs leading-relaxed mb-2" style={{ fontFamily: "var(--font-inter)" }}>{proposal.client_comment}</p>
                          </>
                        )}
                        {proposal.decided_at && <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Decided {new Date(proposal.decided_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>}
                      </div>
                    )}
                  </div>
                )}

                {proposalEditable ? (
                  <form onSubmit={saveProposal} className="border border-white/[0.08] bg-[#161616] p-6">
                    <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>{proposal ? "EDIT PROPOSAL" : "NEW PROPOSAL"}</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Scope of Work</label>
                        <textarea rows={4} value={proposalForm.scope} onChange={e => setProposalForm(f => ({ ...f, scope: e.target.value }))}
                          placeholder="Define the scope of work..."
                          className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Stages of Work</label>
                        <textarea rows={4} value={proposalForm.stages} onChange={e => setProposalForm(f => ({ ...f, stages: e.target.value }))}
                          placeholder="Mood Board → 2D → 3D → Plans → Delivery..."
                          className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Pricing</label>
                        <textarea rows={3} value={proposalForm.pricing} onChange={e => setProposalForm(f => ({ ...f, pricing: e.target.value }))}
                          placeholder="Pricing breakdown, payment schedule..."
                          className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                      <div>
                        <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Terms &amp; Conditions</label>
                        <textarea rows={4} value={proposalForm.terms} onChange={e => setProposalForm(f => ({ ...f, terms: e.target.value }))}
                          placeholder="Terms, timelines, cancellation policy..."
                          className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                          style={{ fontFamily: "var(--font-inter)" }} />
                      </div>
                    </div>
                    {proposalError && <p className="text-red-400/70 text-xs mt-4" style={{ fontFamily: "var(--font-inter)" }}>{proposalError}</p>}
                    {!quoteApproved && <p className="text-amber-400/60 text-xs mt-4" style={{ fontFamily: "var(--font-inter)" }}>Waiting for manager pricing approval</p>}
                    <div className="flex gap-3 mt-5">
                      <button type="submit" disabled={savingProposal || !quoteApproved}
                        className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
                        style={{ fontFamily: "var(--font-inter)" }}>
                        {savingProposal ? "Sending..." : proposalSaved ? "✓ Sent" : proposal?.status === "rejected" ? "Resend to client" : "Send to client"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="border border-white/[0.08] bg-[#161616] p-6 space-y-5">
                    <div>
                      <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>SCOPE OF WORK</p>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{proposal?.scope || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>STAGES OF WORK</p>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{proposal?.stages || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>PRICING</p>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{proposal?.pricing || "—"}</p>
                    </div>
                    <div>
                      <p className="text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TERMS &amp; CONDITIONS</p>
                      <p className="text-white/60 text-xs leading-relaxed whitespace-pre-wrap" style={{ fontFamily: "var(--font-inter)" }}>{proposal?.terms || "—"}</p>
                    </div>
                    {proposal?.pdf_url && (
                      <div className="pt-2">
                        <a href={proposal.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="inline-block px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                          style={{ fontFamily: "var(--font-inter)" }}>Download quotation (PDF)</a>
                      </div>
                    )}
                  </div>
                )}
                {/* INTERNAL NOTES — staff only, never shown to the client */}
                <div className="mt-8 border-t border-white/[0.08] pt-6">
                  <h3 className="text-white text-sm tracking-widest mb-1" style={{ fontFamily: "var(--font-inter)" }}>INTERNAL NOTES</h3>
                  <p className="text-white/25 text-xs mb-4" style={{ fontFamily: "var(--font-inter)" }}>Staff only — the client never sees these.</p>
                  <form onSubmit={handleAddNote} className="mb-4">
                    <textarea value={noteBody} onChange={e => setNoteBody(e.target.value)} rows={2}
                      placeholder="Add a private note for the team..."
                      className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none mb-2"
                      style={{ fontFamily: "var(--font-inter)" }} />
                    {noteError && <p className="text-red-400/70 text-xs mb-2" style={{ fontFamily: "var(--font-inter)" }}>{noteError}</p>}
                    <button type="submit" disabled={savingNote || !noteBody.trim()}
                      className="px-5 py-2 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-30"
                      style={{ fontFamily: "var(--font-inter)" }}>{savingNote ? "Adding..." : "Add note"}</button>
                  </form>
                  {notes.length === 0 ? (
                    <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No notes yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {notes.map(n => (
                        <div key={n.id} className="border border-white/[0.06] bg-white/[0.02] px-4 py-3">
                          <div className="flex items-start justify-between gap-3">
                            <p className="text-white/70 text-xs leading-relaxed whitespace-pre-wrap flex-1" style={{ fontFamily: "var(--font-inter)" }}>{n.body}</p>
                            <button onClick={() => deleteNote(n.id)} className="text-red-400/30 hover:text-red-400/70 transition-colors flex-shrink-0" title="Delete note">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                            </button>
                          </div>
                          <p className="text-white/25 text-xs mt-1.5" style={{ fontFamily: "var(--font-inter)" }}>{n.author_name || "Staff"} · {new Date(n.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric" })} {new Date(n.created_at).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
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
