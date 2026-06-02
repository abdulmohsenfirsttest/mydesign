import Link from "next/link";

const stats = [
  { label: "Active Projects", value: "7", sub: "+2 this month" },
  { label: "Total Clients", value: "14", sub: "3 new this month" },
  { label: "Bookings Today", value: "3", sub: "Next: 10:00 AM" },
  { label: "Pending Signatures", value: "2", sub: "SAR 705,000 total" },
];

const projects = [
  { name: "Villa Interior — Al Nakheel", client: "Ahmed Al-Rashid", stage: "Design", progress: 65, flag: "Review due" },
  { name: "Jewelry Store — Riyadh Gallery", client: "Nora Al-Ghamdi", stage: "Approval", progress: 80, flag: "Awaiting signature" },
  { name: "Corporate Office — NEOM", client: "Faisal Al-Otaibi", stage: "Discovery", progress: 20, flag: "" },
  { name: "Private Residence — Jeddah", client: "Reem Al-Dosari", stage: "Execution", progress: 90, flag: "Handover soon" },
];

const bookings = [
  { time: "10:00 AM", client: "Tariq Al-Hamdan", service: "Interior Design Consultation" },
  { time: "01:00 PM", client: "Lena Müller", service: "3D Modeling Review" },
  { time: "04:00 PM", client: "New Lead", service: "Renovation Planning" },
];

const alerts = [
  { text: "Quote Q-1042 unsigned for 3 days", type: "warn" },
  { text: "Ahmed Al-Rashid requested changes on Living Room Concept A", type: "info" },
  { text: "Nora Al-Ghamdi: new message in Jewelry Store project", type: "info" },
  { text: "Floor Plan v3 downloaded by client", type: "info" },
];

export default function AdminPage() {
  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Admin Dashboard</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Monday, 2 June 2026 — Welcome back, Abdulmohsen</p>
        </div>
        <Link href="/admin/projects" className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Project</Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {stats.map(s => (
          <div key={s.label} className="border border-white/[0.08] bg-[#161616] p-5">
            <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{s.value}</p>
            <p className="text-white/50 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{s.label}</p>
            <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Projects */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ACTIVE PROJECTS</h2>
              <Link href="/admin/projects" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>View all →</Link>
            </div>
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.name} className="border border-white/[0.08] bg-[#161616] p-5 hover:border-white/20 transition-colors">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white/80 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
                      <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Client: {p.client} · Stage: {p.stage}</p>
                    </div>
                    {p.flag && (
                      <span className="text-xs border border-white/25 text-white/50 px-2.5 py-1 whitespace-nowrap" style={{ fontFamily: "var(--font-inter)" }}>{p.flag}</span>
                    )}
                  </div>
                  <div className="h-px bg-white/[0.06]">
                    <div className="h-px bg-white/40" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-white/20 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
                </div>
              ))}
            </div>
          </div>

          {/* Alerts */}
          <div>
            <h2 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>ALERTS</h2>
            <div className="border border-white/[0.08] bg-[#161616]">
              {alerts.map((a, i) => (
                <div key={i} className={`flex items-start gap-3 px-5 py-3.5 ${i < alerts.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                  <div className={`w-1.5 h-1.5 rounded-full mt-1.5 shrink-0 ${a.type === "warn" ? "bg-white/60" : "bg-white/20"}`} />
                  <p className="text-white/40 text-xs leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>{a.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Today's bookings */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TODAY&apos;S BOOKINGS</h2>
            <Link href="/admin/bookings" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>All →</Link>
          </div>
          <div className="border border-white/[0.08] bg-[#161616]">
            {bookings.map((b, i) => (
              <div key={i} className={`px-5 py-4 ${i < bookings.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</p>
                <p className="text-white/50 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.client}</p>
                <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>QUICK ACTIONS</h2>
            <div className="space-y-2">
              {[
                { label: "Send Quote", href: "/admin/quotes" },
                { label: "Upload Files", href: "/admin/uploads" },
                { label: "View Messages", href: "/admin/messages" },
                { label: "Manage Clients", href: "/admin/clients" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between px-4 py-3 border border-white/[0.08] text-white/40 text-xs hover:border-white/25 hover:text-white/70 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {a.label}
                  <span>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
