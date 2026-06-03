"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = { id: string; name: string; email: string; phone: string; created_at: string };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("clients").select("id, name, email, phone, created_at").order("created_at", { ascending: false })
      .then(({ data }) => { setClients(data ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Clients</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All registered clients.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : clients.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No clients yet. They appear here after signing up or being added.</p>
        </div>
      ) : (
        <div className="border border-white/[0.08] bg-[#161616]">
          <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
            <span className="col-span-4">Name</span>
            <span className="col-span-4">Email</span>
            <span className="col-span-3">Phone</span>
            <span className="col-span-1">Joined</span>
          </div>
          {clients.map((c, i) => (
            <div key={c.id} className={`grid grid-cols-12 items-center px-5 py-4 hover:bg-white/[0.02] transition-colors ${i < clients.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <div className="col-span-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/50 text-xs">{c.name[0]}</div>
                <span className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{c.name}</span>
              </div>
              <span className="col-span-4 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.email ?? "—"}</span>
              <span className="col-span-3 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.phone}</span>
              <span className="col-span-1 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                {new Date(c.created_at).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
