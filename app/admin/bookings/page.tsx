const bookings = [
  { date: "Jun 2, 2026", time: "10:00 AM", client: "Tariq Al-Hamdan", service: "Interior Design Consultation", status: "Confirmed" },
  { date: "Jun 2, 2026", time: "01:00 PM", client: "Lena Müller", service: "3D Modeling Review", status: "Confirmed" },
  { date: "Jun 2, 2026", time: "04:00 PM", client: "New Lead", service: "Renovation Planning", status: "Pending" },
  { date: "Jun 3, 2026", time: "11:00 AM", client: "Ahmed Al-Rashid", service: "Material Selection Review", status: "Confirmed" },
  { date: "Jun 4, 2026", time: "02:00 PM", client: "Reem Al-Dosari", service: "Handover Walkthrough", status: "Confirmed" },
  { date: "Jun 5, 2026", time: "10:00 AM", client: "New Lead", service: "Interior Design Consultation", status: "Pending" },
];

const statusStyle: Record<string, string> = {
  Confirmed: "border-white/20 text-white/50",
  Pending: "border-white/10 text-white/25",
};

export default function BookingsPage() {
  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Bookings</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Upcoming appointments and consultation requests.</p>
        </div>
      </div>

      <div className="border border-white/[0.08] bg-[#161616]">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          <span className="col-span-2">Date</span>
          <span className="col-span-1">Time</span>
          <span className="col-span-3">Client</span>
          <span className="col-span-4">Service</span>
          <span className="col-span-2">Status</span>
        </div>
        {bookings.map((b, i) => (
          <div key={i} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < bookings.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
            <span className="col-span-2 text-white/50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.date}</span>
            <span className="col-span-1 text-white/70 text-sm font-medium" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</span>
            <span className="col-span-3 text-white/60 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.client}</span>
            <span className="col-span-4 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</span>
            <div className="col-span-2 flex items-center gap-2">
              <span className={`text-xs px-2.5 py-1 border ${statusStyle[b.status]}`} style={{ fontFamily: "var(--font-inter)" }}>{b.status}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
