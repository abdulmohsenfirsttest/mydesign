import Link from "next/link";

const stats = [
  { label: "Active Projects", value: "3" },
  { label: "Pending Approvals", value: "2" },
  { label: "Unread Messages", value: "5" },
  { label: "Files Shared", value: "18" },
];

const recentProjects = [
  { id: "1", name: "Villa Interior — Al Nakheel", stage: "Design", progress: 65, status: "In Progress" },
  { id: "2", name: "Jewelry Store — Riyadh Gallery", stage: "Approval", progress: 80, status: "Awaiting Approval" },
  { id: "3", name: "Corporate Office — NEOM", stage: "Discovery", progress: 20, status: "In Progress" },
];

const recentActivity = [
  { text: "New file uploaded: Floor Plan v3.pdf", time: "2h ago" },
  { text: "Design concept sent for review", time: "5h ago" },
  { text: "Quote #1042 ready for signature", time: "1d ago" },
  { text: "Message from team: Material samples approved", time: "2d ago" },
  { text: "Project milestone reached: Schematic complete", time: "3d ago" },
];

export default function DashboardPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Good morning, Ahmed</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Here&apos;s what&apos;s happening with your projects today.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="border border-white/[0.08] bg-[#161616] p-5">
            <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{s.value}</p>
            <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ACTIVE PROJECTS</h2>
            <Link href="/dashboard/projects" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>View all →</Link>
          </div>
          <div className="space-y-3">
            {recentProjects.map(p => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                className="block border border-white/[0.08] bg-[#161616] p-5 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
                    <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Stage: {p.stage}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 border ${p.status === "Awaiting Approval" ? "border-white/30 text-white/60" : "border-white/10 text-white/30"}`}
                    style={{ fontFamily: "var(--font-inter)" }}>{p.status}</span>
                </div>
                <div className="h-px bg-white/[0.06] w-full mb-1">
                  <div className="h-px bg-white/40 transition-all" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Activity */}
        <div>
          <h2 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>RECENT ACTIVITY</h2>
          <div className="border border-white/[0.08] bg-[#161616]">
            {recentActivity.map((a, i) => (
              <div key={i} className={`px-5 py-4 ${i < recentActivity.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                <p className="text-white/60 text-xs leading-relaxed mb-1" style={{ fontFamily: "var(--font-inter)" }}>{a.text}</p>
                <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{a.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
