"use client";
import { useState, useRef } from "react";

type MeetingFile = { name: string; size: string };
type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  summary: string;
  decisions: string[];
  files: MeetingFile[];
  status: "Approved" | "Pending Approval";
  approvedOn?: string;
};

const initialData: Record<string, { client: string; project: string; meetings: Meeting[] }> = {
  "1": {
    client: "Ahmed Al-Rashid",
    project: "Villa Interior — Al Nakheel",
    meetings: [
      {
        id: 1, title: "Project Kickoff", date: "Mar 1, 2026", time: "10:00 AM", type: "In-Person",
        summary: "Introduced the design team and walked through the full project scope. Client confirmed priorities: master bedroom, living area, and kitchen are the primary focus.",
        decisions: ["Budget confirmed at SAR 420,000", "Project duration: 6 months", "Client prefers warm beige and off-white palette", "Site survey scheduled for Mar 5"],
        files: [{ name: "Kickoff Brief.pdf", size: "1.2 MB" }],
        status: "Approved", approvedOn: "Mar 3, 2026",
      },
      {
        id: 2, title: "Mood Board Review", date: "Mar 15, 2026", time: "2:00 PM", type: "Video Call",
        summary: "Presented 3 mood board directions. Client selected Direction B — layered textures, arched doorways, and natural stone accents.",
        decisions: ["Direction B approved", "Marble samples to be presented by Mar 22", "Pendant lighting: warm brass finish", "Master bedroom: add a reading nook"],
        files: [{ name: "Mood Board — Direction B.pdf", size: "14 MB" }],
        status: "Approved", approvedOn: "Mar 17, 2026",
      },
      {
        id: 3, title: "3D Renders Review", date: "Jun 1, 2026", time: "3:00 PM", type: "In-Person",
        summary: "Presented 3D renders for the living room, master bedroom, and kitchen. Client loved the living room and kitchen. Requested changes to the master bedroom wardrobe and ceiling treatment.",
        decisions: ["Living room and kitchen renders approved", "Master bedroom: hinged wardrobe doors", "Ceiling: remove cove lighting, keep simple cornice", "Revised renders within one week"],
        files: [{ name: "3D Render — Living Room.jpg", size: "12 MB" }, { name: "3D Render — Kitchen.jpg", size: "10.5 MB" }],
        status: "Pending Approval",
      },
    ],
  },
  "2": {
    client: "Nora Al-Ghamdi",
    project: "Jewelry Store — Riyadh Gallery",
    meetings: [
      {
        id: 1, title: "Brand & Concept Alignment", date: "Jan 10, 2026", time: "1:00 PM", type: "In-Person",
        summary: "Deep dive into the brand identity. Agreed on a monochromatic luxury approach — black, champagne gold, and creamy white.",
        decisions: ["Color palette: black, champagne gold, cream white", "All display units custom-fabricated", "Warm spot lighting only", "Brand logo etched on main counter"],
        files: [{ name: "Brand Guidelines.pdf", size: "5.1 MB" }],
        status: "Approved", approvedOn: "Jan 13, 2026",
      },
      {
        id: 2, title: "Technical Plans Review", date: "Jun 2, 2026", time: "10:30 AM", type: "Video Call",
        summary: "Presented final technical plans for contractor handover. Client to review and sign off before fitout begins.",
        decisions: ["Client to review by Jun 9", "Contractor mobilization Jun 20 upon approval", "Final material specs attached"],
        files: [{ name: "Store Layout Final.pdf", size: "6.8 MB" }],
        status: "Pending Approval",
      },
    ],
  },
  "3": {
    client: "Faisal Al-Otaibi",
    project: "Corporate Office — NEOM",
    meetings: [
      {
        id: 1, title: "Initial Discovery Meeting", date: "May 20, 2026", time: "9:00 AM", type: "In-Person",
        summary: "First meeting to understand the scope. Biophilic, open-plan office for 120 staff across 3 departments.",
        decisions: ["Headcount: 120 employees", "No cubicles — open zones with bookable rooms", "Biophilic elements: living walls, natural materials", "Headcount breakdown doc to be submitted by client"],
        files: [{ name: "Discovery Notes.pdf", size: "0.9 MB" }],
        status: "Pending Approval",
      },
    ],
  },
};

const clientList = [
  { id: "1", client: "Ahmed Al-Rashid", project: "Villa Interior — Al Nakheel", pending: 1 },
  { id: "2", client: "Nora Al-Ghamdi", project: "Jewelry Store — Riyadh Gallery", pending: 1 },
  { id: "3", client: "Faisal Al-Otaibi", project: "Corporate Office — NEOM", pending: 1 },
];

const meetingTypes = ["In-Person", "Video Call", "Phone Call", "Site Visit"];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function AdminMeetingsPage() {
  const [selectedId, setSelectedId] = useState("1");
  const [data, setData] = useState(initialData);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const [saved, setSaved] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const current = data[selectedId];

  function handleAddMeeting(e: React.FormEvent) {
    e.preventDefault();
    const newMeeting: Meeting = {
      id: Date.now(),
      title: form.title,
      date: form.date,
      time: form.time,
      type: form.type,
      summary: form.summary,
      decisions: form.decisions.split("\n").map(d => d.trim()).filter(Boolean),
      files: attachedFiles.map(f => ({ name: f.name, size: `${(f.size / (1024 * 1024)).toFixed(1)} MB` })),
      status: "Pending Approval",
    };
    setData(prev => ({
      ...prev,
      [selectedId]: { ...prev[selectedId], meetings: [...prev[selectedId].meetings, newMeeting] },
    }));
    setForm({ title: "", date: "", time: "", type: "In-Person", summary: "", decisions: "" });
    setAttachedFiles([]);
    setSaved(true);
    setTimeout(() => { setSaved(false); setShowForm(false); }, 1500);
  }

  return (
    <div className="flex h-screen">
      {/* Client list */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MEETINGS</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {clientList.map(c => (
            <button key={c.id} onClick={() => { setSelectedId(c.id); setShowForm(false); }}
              className={`w-full text-left px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selectedId === c.id ? "bg-white/[0.05]" : ""}`}>
              <p className="text-white/70 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{c.client}</p>
              <p className="text-white/25 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>{c.project}</p>
              {c.pending > 0 && (
                <p className="text-white/30 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{c.pending} awaiting client approval</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <div className="flex items-start justify-between mb-8">
            <div>
              <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{current.client}</h2>
              <p className="text-white/30 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{current.project}</p>
            </div>
            <button onClick={() => setShowForm(!showForm)}
              className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors flex-shrink-0"
              style={{ fontFamily: "var(--font-inter)" }}>
              + Log Meeting
            </button>
          </div>

          {/* New meeting form */}
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
                <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Meeting Summary</label>
                <textarea required rows={4} value={form.summary} onChange={e => setForm(f => ({ ...f, summary: e.target.value }))}
                  placeholder="What was discussed in the meeting..."
                  className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                  style={{ fontFamily: "var(--font-inter)" }} />
              </div>

              <div className="mb-4">
                <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Decisions & Agreements <span className="text-white/15 normal-case tracking-normal">(one per line)</span></label>
                <textarea required rows={4} value={form.decisions} onChange={e => setForm(f => ({ ...f, decisions: e.target.value }))}
                  placeholder={"Client approved kitchen layout\nMarble samples to be presented by next week\n..."}
                  className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20 resize-none"
                  style={{ fontFamily: "var(--font-inter)" }} />
              </div>

              <div className="mb-5">
                <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Attach Documentation</label>
                <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setAttachedFiles(Array.from(e.target.files ?? []))} />
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="text-xs border border-white/15 text-white/30 px-4 py-2 hover:border-white/30 hover:text-white/50 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  Browse files
                </button>
                {attachedFiles.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {attachedFiles.map((f, i) => (
                      <p key={i} className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>↳ {f.name}</p>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-3">
                <button type="submit"
                  className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {saved ? "✓ Sent to client" : "Save & Send to Client"}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
              </div>
            </form>
          )}

          {/* Meeting timeline */}
          <div className="space-y-0">
            {current.meetings.map((m, i) => {
              const isApproved = m.status === "Approved";
              return (
                <div key={m.id} className="flex gap-5">
                  <div className="flex flex-col items-center flex-shrink-0 w-5">
                    <div className={`w-3 h-3 rounded-full mt-1 border-2 flex-shrink-0 ${isApproved ? "bg-white border-white" : "border-white/40 bg-transparent"}`} />
                    {i < current.meetings.length - 1 && <div className="w-px flex-1 mt-2 bg-white/10" style={{ minHeight: "32px" }} />}
                  </div>

                  <div className={`flex-1 mb-8 border ${!isApproved ? "border-white/20" : "border-white/[0.08]"} bg-[#161616] p-6`}>
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-white text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.title}</h3>
                        <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m.date} · {m.time} · {m.type}</p>
                      </div>
                      {isApproved ? (
                        <span className="flex items-center gap-1.5 text-white/40 text-xs border border-white/10 px-2.5 py-1 flex-shrink-0"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          <CheckIcon /> Client approved{m.approvedOn ? ` · ${m.approvedOn}` : ""}
                        </span>
                      ) : (
                        <span className="text-amber-400/60 text-xs border border-amber-400/20 px-2.5 py-1 flex-shrink-0"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          Awaiting client approval
                        </span>
                      )}
                    </div>

                    <p className="text-white/50 text-xs leading-relaxed mb-5" style={{ fontFamily: "var(--font-inter)" }}>{m.summary}</p>

                    <div className="mb-4">
                      <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DECISIONS & AGREEMENTS</p>
                      <ul className="space-y-2">
                        {m.decisions.map((d, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-white/50" style={{ fontFamily: "var(--font-inter)" }}>
                            <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>{d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {m.files.length > 0 && (
                      <div>
                        <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DOCUMENTATION</p>
                        <div className="space-y-2">
                          {m.files.map((f, j) => (
                            <div key={j} className="flex items-center justify-between py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                                <FileIcon /><span>{f.name}</span><span className="text-white/20">{f.size}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
