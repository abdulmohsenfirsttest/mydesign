"use client";
import { useEffect, useState, useRef } from "react";
import { supabase } from "@/lib/supabase";

type Client = { id: string; name: string };
type Project = { id: string; name: string; client_id: string };
type Quote = { id: string; client_id: string; project_id: string; title: string; status: string; lines: { item: string; amount: string }[]; files: { name: string; size: string; url: string }[]; created_at: string; clients: { name: string } | null; projects: { name: string } | null };

const statusStyle: Record<string, string> = {
  "Pending Signature": "border-white/40 text-white/60",
  "Signed": "border-white/15 text-white/30",
  "Draft": "border-white/10 text-white/20",
};

export default function QuotesPage() {
  const [showForm, setShowForm] = useState(false);
  const [lines, setLines] = useState([{ item: "", amount: "" }]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [selectedProject, setSelectedProject] = useState("");
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("clients").select("id, name").then(({ data }) => setClients(data ?? []));
    supabase.from("projects").select("id, name, client_id").then(({ data }) => setProjects(data ?? []));
    fetchQuotes();

    const channel = supabase.channel("admin-quotes")
      .on("postgres_changes", { event: "*", schema: "public", table: "quotes" }, fetchQuotes)
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  function fetchQuotes() {
    supabase.from("quotes").select("*, clients(name), projects(name)").order("created_at", { ascending: false })
      .then(({ data }) => setQuotes((data as Quote[]) ?? []));
  }

  const filteredProjects = selectedClient ? projects.filter(p => p.client_id === selectedClient) : projects;

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);

    const uploadedFiles: { name: string; size: string; url: string }[] = [];
    for (const file of attachedFiles) {
      const path = `${selectedProject}/${Date.now()}-${file.name}`;
      const { error } = await supabase.storage.from("quotes").upload(path, file);
      if (!error) {
        const { data: urlData } = supabase.storage.from("quotes").getPublicUrl(path);
        uploadedFiles.push({ name: file.name, size: `${(file.size / (1024 * 1024)).toFixed(1)} MB`, url: urlData.publicUrl });
      }
    }

    const { data } = await supabase.from("quotes").insert({
      client_id: selectedClient,
      project_id: selectedProject,
      title,
      status: "Pending Signature",
      lines,
      files: uploadedFiles,
    }).select("*, clients(name), projects(name)").single();
    if (data) setQuotes(prev => [data as Quote, ...prev]);
    setLines([{ item: "", amount: "" }]);
    setAttachedFiles([]);
    setSelectedClient("");
    setSelectedProject("");
    setTitle("");
    setSaving(false);
    setShowForm(false);
  }

  async function deleteQuote(id: string) {
    if (!confirm("Delete this quote?")) return;
    setDeleting(id);
    await supabase.from("quotes").delete().eq("id", id);
    setQuotes(prev => prev.filter(q => q.id !== id));
    setDeleting(null);
  }

  function total(lines: { item: string; amount: string }[]) {
    return lines.reduce((sum, l) => {
      const n = parseFloat(l.amount.replace(/[^0-9.]/g, ""));
      return sum + (isNaN(n) ? 0 : n);
    }, 0).toLocaleString("en-SA", { minimumFractionDigits: 0 });
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Quotes & E-sign</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Create and send financial offers to clients.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Quote</button>
      </div>

      {showForm && (
        <form onSubmit={handleSend} className="border border-white/[0.08] bg-[#161616] p-6 mb-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW QUOTE</h2>
          <div className="mb-4">
            <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Title</label>
            <select required value={title} onChange={e => setTitle(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
              <option value="">Select a title...</option>
              <option>Quotation</option>
              <option>Mood Board</option>
              <option>2D Plans</option>
              <option>3D Plans</option>
              <option>First Payment</option>
              <option>Second Payment</option>
              <option>Final Payment</option>
              <option>Delivery</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Client</label>
              <select required value={selectedClient} onChange={e => { setSelectedClient(e.target.value); setSelectedProject(""); }}
                className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Project</label>
              <select required value={selectedProject} onChange={e => setSelectedProject(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select project</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <h3 className="text-white/30 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>LINE ITEMS</h3>
          <div className="space-y-2 mb-3">
            {lines.map((line, i) => (
              <div key={i} className="flex items-center gap-3">
                <input required placeholder="Description" value={line.item}
                  onChange={e => { const l = [...lines]; l[i].item = e.target.value; setLines(l); }}
                  className="flex-1 bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20" style={{ fontFamily: "var(--font-inter)" }} />
                <input required placeholder="SAR 0" value={line.amount}
                  onChange={e => { const l = [...lines]; l[i].amount = e.target.value; setLines(l); }}
                  className="w-32 bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20" style={{ fontFamily: "var(--font-inter)" }} />
                {lines.length > 1 && (
                  <button type="button" onClick={() => setLines(l => l.filter((_, j) => j !== i))}
                    className="text-red-400/30 hover:text-red-400/70 transition-colors flex-shrink-0">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12"/></svg>
                  </button>
                )}
              </div>
            ))}
          </div>
          <button type="button" onClick={() => setLines(l => [...l, { item: "", amount: "" }])}
            className="text-white/25 text-xs hover:text-white/50 transition-colors mb-5" style={{ fontFamily: "var(--font-inter)" }}>+ Add line</button>

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
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40" style={{ fontFamily: "var(--font-inter)" }}>
              {saving ? "Saving..." : "Send for Signature"}
            </button>
            <button type="button" onClick={() => setShowForm(false)}
              className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
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
            <div key={q.id} className="border border-white/[0.08] bg-[#161616]">
              <button onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                className="w-full flex items-center justify-between px-6 py-5 hover:bg-white/[0.02] transition-colors">
                <div className="flex items-center gap-6 text-left">
                  <div>
                    <p className="text-white/80 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{q.title || "—"} · {q.clients?.name ?? "—"}</p>
                    <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{q.projects?.name ?? "—"} · {new Date(q.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-white text-sm" style={{ fontFamily: "var(--font-playfair)" }}>SAR {total(q.lines)}</span>
                  <span className={`text-xs px-3 py-1 border ${statusStyle[q.status] ?? statusStyle["Draft"]}`} style={{ fontFamily: "var(--font-inter)" }}>{q.status}</span>
                  {q.status === "Signed" && (
                    <button onClick={async e => { e.stopPropagation(); await supabase.from("quotes").update({ status: "Pending Signature" }).eq("id", q.id); setQuotes(prev => prev.map(x => x.id === q.id ? { ...x, status: "Pending Signature" } : x)); }}
                      className="text-white/20 text-xs border border-white/10 px-2.5 py-1 hover:border-white/30 hover:text-white/50 transition-colors"
                      style={{ fontFamily: "var(--font-inter)" }}>Unapprove</button>
                  )}
                  <button onClick={e => { e.stopPropagation(); deleteQuote(q.id); }} disabled={deleting === q.id}
                    className="text-red-400/30 hover:text-red-400/60 transition-colors disabled:opacity-30 p-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                  <svg className={`w-4 h-4 text-white/30 transition-transform ${expanded === q.id ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 9l-7 7-7-7"/></svg>
                </div>
              </button>
              {expanded === q.id && (
                <div className="border-t border-white/[0.06] px-6 py-5">
                  <div className="space-y-2 mb-4">
                    {q.lines.map((l, j) => (
                      <div key={j} className="flex justify-between text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                        <span className="text-white/40">{l.item}</span>
                        <span className="text-white/60">{l.amount}</span>
                      </div>
                    ))}
                    <div className="flex justify-between text-sm pt-3 border-t border-white/[0.08]" style={{ fontFamily: "var(--font-inter)" }}>
                      <span className="text-white/50">Total</span>
                      <span className="text-white">SAR {total(q.lines)}</span>
                    </div>
                  </div>
                  {q.files?.length > 0 && (
                    <div className="mt-4 space-y-2">
                      <p className="text-white/20 text-xs tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ATTACHMENTS</p>
                      {q.files.map((f, j) => (
                        <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                          <svg className="w-3.5 h-3.5 flex-shrink-0 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                          <span className="flex-1 text-white/50 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
                          <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
                          <a href={f.url} target="_blank" rel="noopener noreferrer" className="text-white/20 hover:text-white/60 transition-colors" title="Open">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/></svg>
                          </a>
                        </div>
                      ))}
                    </div>
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
