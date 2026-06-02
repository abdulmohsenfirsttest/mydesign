"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  approved_at: string | null;
  project_id: string;
};

type Project = { id: string; name: string };

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

export default function MeetingsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clientId = localStorage.getItem("client_id");
    if (!clientId) { router.push("/auth/login"); return; }

    supabase.from("projects").select("id, name").eq("client_id", clientId).then(({ data }) => {
      const list = data ?? [];
      setProjects(list);
      if (list.length > 0) setSelectedId(list[0].id);
      setLoading(false);
    });
  }, [router]);

  useEffect(() => {
    if (!selectedId) return;
    supabase.from("meetings").select("*").eq("project_id", selectedId).order("created_at").then(({ data }) => {
      setMeetings(data ?? []);
    });
  }, [selectedId]);

  async function approveMeeting(meetingId: string) {
    await supabase.from("meetings").update({ status: "Approved", approved_at: new Date().toISOString() }).eq("id", meetingId);
    setMeetings(prev => prev.map(m => m.id === meetingId ? { ...m, status: "Approved", approved_at: new Date().toISOString() } : m));
  }

  const selectedProject = projects.find(p => p.id === selectedId);

  return (
    <div className="flex h-screen">
      {/* Project list */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MEETINGS</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <p className="px-5 py-4 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
          ) : projects.length === 0 ? (
            <p className="px-5 py-4 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
          ) : projects.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selectedId === p.id ? "bg-white/[0.05]" : ""}`}>
              <p className="text-white/70 text-xs leading-snug" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Meeting timeline */}
      <div className="flex-1 overflow-y-auto p-8">
        {!selectedProject ? null : (
          <div className="max-w-2xl">
            <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{selectedProject.name}</h2>
            <p className="text-white/30 text-sm mb-10" style={{ fontFamily: "var(--font-inter)" }}>Meeting log — review and approve each session&apos;s documentation.</p>

            {meetings.length === 0 ? (
              <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
                <p className="text-white/30 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No meetings logged yet.</p>
              </div>
            ) : (
              <div className="space-y-0">
                {meetings.map((m, i) => {
                  const isApproved = m.status === "Approved";
                  return (
                    <div key={m.id} className="flex gap-5">
                      <div className="flex flex-col items-center flex-shrink-0 w-5">
                        <div className={`w-3 h-3 rounded-full mt-1 border-2 flex-shrink-0 ${isApproved ? "bg-white border-white" : "border-white/40 bg-transparent"}`} />
                        {i < meetings.length - 1 && <div className="w-px flex-1 mt-2 bg-white/10" style={{ minHeight: "32px" }} />}
                      </div>
                      <div className={`flex-1 mb-8 border ${!isApproved ? "border-white/20" : "border-white/[0.08]"} bg-[#161616] p-6`}>
                        <div className="flex items-start justify-between gap-4 mb-4">
                          <div>
                            <h3 className="text-white text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.title}</h3>
                            <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m.date} · {m.time} · {m.type}</p>
                          </div>
                          {isApproved ? (
                            <span className="flex items-center gap-1.5 text-white/40 text-xs border border-white/10 px-2.5 py-1 flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>
                              <CheckIcon /> Approved
                            </span>
                          ) : (
                            <span className="text-white/50 text-xs border border-white/30 px-2.5 py-1 flex-shrink-0" style={{ fontFamily: "var(--font-inter)" }}>Pending Approval</span>
                          )}
                        </div>

                        {m.summary && <p className="text-white/50 text-xs leading-relaxed mb-5" style={{ fontFamily: "var(--font-inter)" }}>{m.summary}</p>}

                        {m.decisions?.length > 0 && (
                          <div className="mb-5">
                            <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DECISIONS & AGREEMENTS</p>
                            <ul className="space-y-2">
                              {m.decisions.map((d, j) => (
                                <li key={j} className="flex items-start gap-2.5 text-xs text-white/50" style={{ fontFamily: "var(--font-inter)" }}>
                                  <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>{d}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {m.files?.length > 0 && (
                          <div className="mb-5">
                            <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DOCUMENTATION</p>
                            <div className="space-y-2">
                              {m.files.map((f, j) => (
                                <div key={j} className="flex items-center gap-2 py-2 px-3 border border-white/[0.06] bg-white/[0.02] text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                                  <FileIcon /><span>{f.name}</span><span className="text-white/20">{f.size}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {!isApproved && (
                          <div className="pt-2 border-t border-white/[0.06]">
                            <p className="text-white/25 text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                              By approving, you confirm these notes accurately reflect what was discussed.
                            </p>
                            <button onClick={() => approveMeeting(m.id)}
                              className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                              style={{ fontFamily: "var(--font-inter)" }}>
                              Approve Meeting Notes
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
