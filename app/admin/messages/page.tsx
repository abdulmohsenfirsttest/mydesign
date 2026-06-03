"use client";
import { useState, useRef, useEffect } from "react";
import { supabase } from "@/lib/supabase";

type Meeting = {
  id: string;
  title: string;
  date: string;
  time: string;
  type: string;
  summary: string;
  decisions: string[];
  files: { name: string; size: string }[];
  status: string;
  project_id: string;
};

type Project = { id: string; name: string; client_name: string };

const meetingTypes = ["In-Person", "Video Call", "Phone Call", "Site Visit"];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

export default function AdminMeetingsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.from("projects").select("id, name, clients(name)").then(({ data }) => {
      const list = (data ?? []).map((p: any) => ({
        id: p.id,
        name: p.name,
        client_name: p.clients?.name ?? "—",
      }));
      setProjects(list);
      if (list.length > 0) setSelectedId(list[0].id);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("meetings").select("*").eq("project_id", selectedId).order("created_at")
      .then(({ data }) => setMeetings(data ?? []));
  }, [selectedId]);

  async function handleAddMeeting(e: React.FormEvent) {
    e.preventDefault();
    const newMeeting = {
      project_id: selectedId,
      title: form.title,
      date: form.date,
      time: form.time,
      type: form.type,
      summary: form.summary,
      decisions: form.decisions.split("\n").map(d => d.trim()).filter(Boolean),
      files: attachedFiles.map(f => ({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` })),
      status: "Pending Approval",
    };
    const { data } = await supabase.from("meetings").insert(newMeeting).select().single();
    if (data) setMeetings(prev => [...prev, data]);
    setForm({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
    setAttachedFiles([]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1500);
  }

  const selected = projects.find(p => p.id === selectedId);

  return (
    <div className="flex h-screen">
      {/* Client/project list */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MEETINGS</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projects.length === 0 ? (
            <p className="px-5 py-4 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
          ) : projects.map(p => (
            <button key={p.id} onClick={() => { setSelectedId(p.id); setShowForm(false); }}
              className={`w-full text-left px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selectedId === p.id ? "bg-white/[0.05]" : ""}`}>
              <p className="text-white/70 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.client_name}</p>
              <p className="text-white/25 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-8">
        {selected && (
          <div className="max-w-2xl">
            <div className="flex items-start justify-between mb-8">
              <div>
                <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{selected.client_name}</h2>
                <p className="text-white/30 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{selected.name}</p>
              </div>
              <button onClick={() => setShowForm(!showForm)}
                className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors flex-shrink-0"
                style={{ fontFamily: "var(--font-inter)" }}>+ Log Meeting</button>
            </div>

            {showForm && (
              <form onSubmit={handleAddMeeting} className="border border-white/20 bg-[#161616] p-6 mb-8">
                <h3 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW MEETING LOG</h3>
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="col-span-2">
                    <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Meeting Title</label>
                    <input required value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                      placeholder="e.g. 3D Renders Review"
                      className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                      style={{ fontFamily: "var(--font-inter)" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Date</label>
                    <input required type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                      className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                      style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                  </div>
                  <div>
                    <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Time</label>
                    <input required type="time" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))}
                      className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                      style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Meeting Type</label>
                    <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                      className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                      style={{ fontFamily: "var(--font-inter)" }}>
                      {meetingTypes.map(t => <option key={t}>{t}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Summary</label>
                  <textarea required rows={4} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                    placeholder="What was discussed..."
                    className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                    style={{ fontFamily: "var(--font-inter)" }} />
                </div>
                <div className="mb-4">
                  <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Decisions <span className="text-white/15 normal-case tracking-normal">(one per line)</span></label>
                  <textarea rows={3} value={form.decisions} onChange={e => setForm(f => ({ ...f, decisions: e.target.value }))}
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
                  <button type="submit" className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
                    {saved ? "✓ Saved" : "Save & Send to Client"}
                  </button>
                  <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
                </div>
              </form>
            )}

            {meetings.length === 0 ? (
              <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No meetings logged yet. Click &quot;Log Meeting&quot; to add one.</p>
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
                          <span className="flex items-center gap-1.5 text-white/40 text-xs border border-white/10 px-2.5 py-1 flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
                            <CheckIcon /> Client approved
                          </span>
                        ) : (
                          <span className="text-amber-400/60 text-xs border border-amber-400/20 px-2.5 py-1 flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>Awaiting approval</span>
                        )}
                      </div>
                      {m.summary && <p className="text-white/50 text-xs leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>{m.summary}</p>}
                      {m.decisions?.length > 0 && (
                        <ul className="space-y-1.5">
                          {m.decisions.map((d, j) => (
                            <li key={j} className="flex items-start gap-2 text-xs text-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                              <span className="text-white/20 flex-shrink-0">—</span>{d}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
