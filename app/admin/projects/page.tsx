const projects = [
  { name: "Villa Interior — Al Nakheel", client: "Ahmed Al-Rashid", type: "Interior", stage: "3D", progress: 57, started: "Mar 2026", budget: "SAR 420K" },
  { name: "Jewelry Store — Riyadh Gallery", client: "Nora Al-Ghamdi", type: "Commercial", stage: "Plans", progress: 71, started: "Jan 2026", budget: "SAR 285K" },
  { name: "Corporate Office — NEOM", client: "Faisal Al-Otaibi", type: "Office", stage: "Quotation", progress: 14, started: "May 2026", budget: "SAR 680K" },
  { name: "Private Residence — Jeddah", client: "Reem Al-Dosari", type: "Interior", stage: "Payment", progress: 86, started: "Nov 2025", budget: "SAR 310K" },
];

const stages = ["Quotation", "Mood Board", "2D", "3D", "Plans", "Payment", "Delivery"];

export default function AdminProjectsPage() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Projects</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All client projects and their current stages.</p>
        </div>
        <button className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Project</button>
      </div>

      <div className="space-y-3">
        {projects.map(p => (
          <div key={p.name} className="border border-white/[0.08] bg-[#161616] p-6 hover:border-white/20 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-white/80 text-base mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</h2>
                <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                  {p.client} · {p.type} · Started {p.started} · Budget {p.budget}
                </p>
              </div>
              <span className="text-white/50 text-xs border border-white/15 px-2.5 py-1" style={{ fontFamily: "var(--font-inter)" }}>{p.stage}</span>
            </div>

            <div className="flex justify-between text-xs text-white/15 mb-2" style={{ fontFamily: "var(--font-inter)" }}>
              {stages.map(s => <span key={s} className={s === p.stage ? "text-white/50" : ""}>{s}</span>)}
            </div>
            <div className="h-px bg-white/[0.06]">
              <div className="h-px bg-white/40 transition-all" style={{ width: `${p.progress}%` }} />
            </div>
            <p className="text-white/20 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
          </div>
        ))}
      </div>
    </div>
  );
}
