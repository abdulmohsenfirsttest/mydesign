"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = { id: string; date: string; time: string; name: string; email: string; phone: string; service: string; status: string };

const statusStyle: Record<string, string> = {
  Confirmed: "border-white/20 text-white/50",
  Pending: "border-white/10 text-white/25",
  Cancelled: "border-red-400/20 text-red-400/40",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("bookings").select("*").order("date").order("time")
      .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Bookings</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Consultation requests from the booking page.</p>
      </div>

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No bookings yet. They appear here when clients book via the website.</p>
        </div>
      ) : (
        <div className="border border-white/[0.08] bg-[#161616]">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="col-span-2">Date</span>
            <span className="col-span-1">Time</span>
            <span className="col-span-2">Name</span>
            <span className="col-span-2">Phone</span>
            <span className="col-span-3">Service</span>
            <span className="col-span-2">Status</span>
          </div>
          {bookings.map((b, i) => (
            <div key={b.id} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < bookings.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <span className="col-span-2 text-white/50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.date}</span>
              <span className="col-span-1 text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</span>
              <span className="col-span-2 text-white/60 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.name}</span>
              <span className="col-span-2 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.phone}</span>
              <span className="col-span-3 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</span>
              <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                className={`col-span-2 text-xs px-2.5 py-1 border bg-transparent cursor-pointer focus:outline-none ${statusStyle[b.status] ?? statusStyle.Pending}`}
                style={{ fontFamily: "var(--font-inter)" }}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
