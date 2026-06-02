const projectData: Record<string, {
  name: string; type: string; stage: string; progress: number;
  description: string; team: string[];
  timeline: { stage: string; date: string; done: boolean; active: boolean; note: string }[];
  files: { name: string; size: string; date: string }[];
}> = {
  "1": {
    name: "Villa Interior — Al Nakheel District",
    type: "Interior Design",
    stage: "Design",
    progress: 65,
    description: "Full interior design and fit-out for a 600 sqm private villa. Includes living areas, bedrooms, kitchen, and outdoor spaces.",
    team: ["Sara Al-Otaibi (Lead Designer)", "Khalid Hassan (3D Visualization)", "Nora Al-Ghamdi (Project Manager)"],
    timeline: [
      { stage: "Discovery", date: "Mar 1, 2026", done: true, active: false, note: "Client brief completed, site survey done." },
      { stage: "Design", date: "Mar 20, 2026", done: false, active: true, note: "Schematic design approved. Working on detailed drawings." },
      { stage: "Approval", date: "Apr 15, 2026", done: false, active: false, note: "Client sign-off on final design package." },
      { stage: "Execution", date: "May 1, 2026", done: false, active: false, note: "Construction and fit-out phase begins." },
      { stage: "Handover", date: "Aug 30, 2026", done: false, active: false, note: "Final walkthrough and project handover." },
    ],
    files: [
      { name: "Floor Plan v3.pdf", size: "4.2 MB", date: "Jun 1, 2026" },
      { name: "3D Render — Living Room.jpg", size: "12 MB", date: "May 28, 2026" },
      { name: "Material Palette.pdf", size: "8.1 MB", date: "May 20, 2026" },
    ],
  },
  "2": {
    name: "Jewelry Store — Riyadh Gallery Mall",
    type: "Commercial Design",
    stage: "Approval",
    progress: 80,
    description: "Luxury jewelry store interior with custom display units, lighting design, and brand-aligned aesthetic for a high-footfall mall location.",
    team: ["Omar Al-Dossari (Lead Designer)", "Hessa Al-Faisal (Brand Consultant)"],
    timeline: [
      { stage: "Discovery", date: "Jan 5, 2026", done: true, active: false, note: "Brand guidelines received, site measurements complete." },
      { stage: "Design", date: "Feb 1, 2026", done: true, active: false, note: "All design drawings finalized and approved internally." },
      { stage: "Approval", date: "Jun 2, 2026", done: false, active: true, note: "Awaiting client signature on final design package." },
      { stage: "Execution", date: "Jun 20, 2026", done: false, active: false, note: "Contractor mobilization and build-out." },
      { stage: "Handover", date: "Aug 1, 2026", done: false, active: false, note: "Store opening and final handover." },
    ],
    files: [
      { name: "Store Layout Final.pdf", size: "6.8 MB", date: "Jun 2, 2026" },
      { name: "Lighting Scheme.pdf", size: "3.4 MB", date: "May 30, 2026" },
    ],
  },
  "3": {
    name: "Corporate Office — NEOM",
    type: "Office Design",
    stage: "Discovery",
    progress: 20,
    description: "Modern open-plan office design for a 1,200 sqm corporate space in NEOM. Focus on biophilic design and collaborative workspaces.",
    team: ["Reem Al-Zahrawi (Lead Designer)"],
    timeline: [
      { stage: "Discovery", date: "May 15, 2026", done: false, active: true, note: "Initial client meetings ongoing. Space analysis in progress." },
      { stage: "Design", date: "Jul 1, 2026", done: false, active: false, note: "" },
      { stage: "Approval", date: "Aug 15, 2026", done: false, active: false, note: "" },
      { stage: "Execution", date: "Sep 1, 2026", done: false, active: false, note: "" },
      { stage: "Handover", date: "Dec 1, 2026", done: false, active: false, note: "" },
    ],
    files: [],
  },
};

export default async function ProjectDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const project = projectData[id] ?? projectData["1"];

  return (
    <div className="p-8">
      <div className="mb-8">
        <p className="text-white/30 text-xs mb-2" style={{ fontFamily: "var(--font-inter)" }}>← Projects</p>
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{project.name}</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{project.type} · {project.progress}% complete</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Timeline */}
          <div className="border border-white/[0.08] bg-[#161616] p-6">
            <h2 className="text-white text-sm tracking-widest mb-6" style={{ fontFamily: "var(--font-inter)" }}>PROJECT TIMELINE</h2>
            <div className="space-y-0">
              {project.timeline.map((t, i) => (
                <div key={t.stage} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className={`w-3 h-3 rounded-full mt-0.5 border ${t.done ? "bg-white border-white" : t.active ? "border-white bg-transparent" : "border-white/20 bg-transparent"}`} />
                    {i < project.timeline.length - 1 && <div className={`w-px flex-1 mt-1 ${t.done ? "bg-white/40" : "bg-white/10"}`} style={{ minHeight: "40px" }} />}
                  </div>
                  <div className="pb-8">
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`text-sm ${t.active ? "text-white" : t.done ? "text-white/50" : "text-white/20"}`} style={{ fontFamily: "var(--font-inter)" }}>{t.stage}</span>
                      <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{t.date}</span>
                      {t.active && <span className="text-xs border border-white/30 text-white/50 px-2 py-0.5" style={{ fontFamily: "var(--font-inter)" }}>Current</span>}
                    </div>
                    {t.note && <p className="text-white/30 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Files */}
          <div className="border border-white/[0.08] bg-[#161616] p-6">
            <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>FILES & DELIVERABLES</h2>
            {project.files.length === 0 ? (
              <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No files shared yet.</p>
            ) : (
              <div className="space-y-2">
                {project.files.map(f => (
                  <div key={f.name} className="flex items-center justify-between py-3 border-b border-white/[0.06] last:border-0">
                    <div className="flex items-center gap-3">
                      <svg className="w-4 h-4 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>
                      <div>
                        <p className="text-white/70 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</p>
                        <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size} · {f.date}</p>
                      </div>
                    </div>
                    <button className="text-white/20 hover:text-white/60 transition-colors">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar info */}
        <div className="space-y-4">
          <div className="border border-white/[0.08] bg-[#161616] p-5">
            <h3 className="text-white/40 text-xs tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>PROJECT INFO</h3>
            <p className="text-white/50 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{project.description}</p>
          </div>
          <div className="border border-white/[0.08] bg-[#161616] p-5">
            <h3 className="text-white/40 text-xs tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>YOUR TEAM</h3>
            <div className="space-y-2">
              {project.team.map(m => (
                <div key={m} className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-white/10 flex items-center justify-center text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m[0]}</div>
                  <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="border border-white/[0.08] bg-[#161616] p-5">
            <h3 className="text-white/40 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>PROGRESS</h3>
            <p className="text-3xl text-white font-light mb-2" style={{ fontFamily: "var(--font-playfair)" }}>{project.progress}%</p>
            <div className="h-px bg-white/[0.08]">
              <div className="h-px bg-white/50" style={{ width: `${project.progress}%` }} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
