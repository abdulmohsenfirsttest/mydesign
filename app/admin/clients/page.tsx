"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = { id: string; name: string; email: string; phone: string; created_at: string };

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", phone: "", email: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    supabase.from("clients").select("id, name, email, phone, created_at").order("created_at", { ascending: false })
      .then(({ data }) => { setClients(data ?? []); setLoading(false); });
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { data, error: err } = await supabase
      .from("clients")
      .insert({ name: form.name, phone: form.phone, email: form.email, password: "123123" })
      .select()
      .single();
    if (err) {
      setError(err.message.includes("unique") ? "This phone number is already registered." : err.message);
      setSaving(false);
      return;
    }
    setClients(prev => [data, ...prev]);
    setForm({ name: "", phone: "", email: "" });
    setSaving(false);
    setShowForm(false);
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Clients</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All registered clients.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ Add Client</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-white/[0.08] bg-[#161616] p-6 mb-6 max-w-lg">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW CLIENT</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Full Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Ahmed Al-Rashid"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Phone (with country code)</label>
              <input required value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="+966501234567"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Email (optional)</label>
              <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="client@example.com"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
          </div>
          {error && <p className="text-red-400/70 text-xs mt-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <p className="text-white/20 text-xs mt-3" style={{ fontFamily: "var(--font-inter)" }}>Default password: 123123</p>
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-inter)" }}>{saving ? "Saving..." : "Create Client"}</button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : clients.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>No clients yet.</p>
          <p className="text-white/15 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Click &quot;+ Add Client&quot; to create one.</p>
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
              <span className="col-span-4 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{c.email || "—"}</span>
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
