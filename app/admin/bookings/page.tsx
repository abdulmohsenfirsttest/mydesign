"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Booking = { id: string; date: string; time: string; name: string; email: string; phone: string; service: string; status: string; client_created?: boolean };

const statusStyle: Record<string, string> = {
  Confirmed: "border-border text-muted-2",
  Pending: "border-soft text-muted-2",
  Cancelled: "border-red-400/20 text-red-400/40",
};

export default function BookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState<string | null>(null);
  const [created, setCreated] = useState<Set<string>>(new Set());

  useEffect(() => {
    function fetchBookings() {
      supabase.from("bookings").select("*").order("date").order("time")
        .then(({ data }) => { setBookings(data ?? []); setLoading(false); });
    }

    fetchBookings();

    const channel = supabase.channel("admin-bookings")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchBookings)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function updateStatus(id: string, status: string) {
    await supabase.from("bookings").update({ status }).eq("id", id);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
  }

  async function createClient(b: Booking) {
    setCreating(b.id);
    const { error } = await supabase.from("clients").upsert(
      { name: b.name, phone: b.phone, email: b.email ?? "", password: "123123" },
      { onConflict: "phone", ignoreDuplicates: true }
    );
    setCreating(null);
    if (!error) {
      setCreated(prev => new Set(prev).add(b.id));
    }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Bookings</h1>
        <p className="text-muted-1 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Consultation requests from the booking page.</p>
      </div>

      {loading ? (
        <p className="text-muted-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : bookings.length === 0 ? (
        <div className="border border-soft bg-surface p-12 text-center">
          <p className="text-muted-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No bookings yet.</p>
        </div>
      ) : (
        <div className="border border-soft bg-surface">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-soft text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="col-span-2">Date</span>
            <span className="col-span-1">Time</span>
            <span className="col-span-2">Name</span>
            <span className="col-span-2">Phone</span>
            <span className="col-span-2">Service</span>
            <span className="col-span-1">Status</span>
            <span className="col-span-2">Client</span>
          </div>
          {bookings.map((b, i) => (
            <div key={b.id} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-fill transition-colors ${i < bookings.length - 1 ? "border-b border-soft" : ""}`}>
              <span className="col-span-2 text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.date}</span>
              <span className="col-span-1 text-muted-1 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</span>
              <span className="col-span-2 text-muted-1 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.name}</span>
              <span className="col-span-2 text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.phone}</span>
              <span className="col-span-2 text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</span>
              <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                className={`col-span-1 text-xs px-2 py-1 border bg-transparent cursor-pointer focus:outline-none ${statusStyle[b.status] ?? statusStyle.Pending}`}
                style={{ fontFamily: "var(--font-inter)" }}>
                <option value="Pending">Pending</option>
                <option value="Confirmed">Confirmed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
              <div className="col-span-2">
                {created.has(b.id) ? (
                  <span className="text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>✓ Created</span>
                ) : (
                  <button onClick={() => createClient(b)} disabled={creating === b.id}
                    className="text-xs border border-border text-muted-2 px-2.5 py-1 hover:border-strong hover:text-muted-1 transition-colors disabled:opacity-30"
                    style={{ fontFamily: "var(--font-inter)" }}>
                    {creating === b.id ? "..." : "+ Add to Clients"}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
