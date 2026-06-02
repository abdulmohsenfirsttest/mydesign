const clients = [
  { name: "Ahmed Al-Rashid", email: "ahmed@example.com", phone: "+966 50 111 2233", projects: 1, status: "Active", joined: "Mar 2026" },
  { name: "Nora Al-Ghamdi", email: "nora@example.com", phone: "+966 55 222 4455", projects: 1, status: "Active", joined: "Jan 2026" },
  { name: "Faisal Al-Otaibi", email: "faisal@example.com", phone: "+966 54 333 6677", projects: 1, status: "Active", joined: "May 2026" },
  { name: "Reem Al-Dosari", email: "reem@example.com", phone: "+966 50 444 8899", projects: 1, status: "Active", joined: "Nov 2025" },
  { name: "Tariq Al-Hamdan", email: "tariq@example.com", phone: "+966 56 555 0011", projects: 0, status: "Lead", joined: "Jun 2026" },
  { name: "Lena Müller", email: "lena@example.com", phone: "+49 151 2345 6789", projects: 0, status: "Lead", joined: "Jun 2026" },
];

export default function ClientsPage() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Clients</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All registered clients and leads.</p>
        </div>
        <button className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ Add Client</button>
      </div>

      <div className="border border-white/[0.08] bg-[#161616]">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          <span className="col-span-3">Name</span>
          <span className="col-span-3">Email</span>
          <span className="col-span-2">Phone</span>
          <span className="col-span-1">Projects</span>
          <span className="col-span-1">Joined</span>
          <span className="col-span-2">Status</span>
        </div>
        {clients.map((c, i) => (
          <div key={c.name} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < clients.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
            <div className="col-span-3 flex items-center gap-3">
              <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.name[0]}</div>
              <span className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{c.name}</span>
            </div>
            <span className="col-span-3 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.email}</span>
            <span className="col-span-2 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.phone}</span>
            <span className="col-span-1 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.projects}</span>
            <span className="col-span-1 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.joined}</span>
            <div className="col-span-2">
              <span className={`text-xs px-2.5 py-1 border ${c.status === "Active" ? "border-white/20 text-white/50" : "border-white/10 text-white/25"}`}
                style={{ fontFamily: "var(--font-inter)" }}>{c.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
