"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { getAdmin, ROLES, roleLabel, type Role } from "@/lib/roles";

type Staff = { id: string; name: string; phone: string; role: string; created_at: string };

export default function StaffPage() {
  const router = useRouter();
  const [authorized, setAuthorized] = useState<boolean | null>(null);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<{ name: string; phone: string; password: string; role: Role }>({ name: "", phone: "", password: "123123", role: "designer" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    const a = getAdmin();
    if (!a) { router.replace("/auth/login"); return; }
    if (a.role !== "manager") { setAuthorized(false); return; }
    setAuthorized(true);
    fetchStaff();
  }, [router]);

  function fetchStaff() {
    supabase.from("admins").select("id, name, phone, role, created_at").order("created_at")
      .then(({ data }) => setStaff((data as Staff[]) ?? []));
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const { error: err } = await supabase.from("admins").insert({
      name: form.name, phone: form.phone.trim(), password: form.password, role: form.role,
    });
    if (err) { setError(err.message); setSaving(false); return; }
    setForm({ name: "", phone: "", password: "123123", role: "designer" });
    setSaving(false);
    setShowForm(false);
    fetchStaff();
  }

  async function remove(id: string) {
    if (!confirm("Remove this staff member?")) return;
    setDeleting(id);
    await supabase.from("admins").delete().eq("id", id);
    setStaff((prev) => prev.filter((s) => s.id !== id));
    setDeleting(null);
  }

  if (authorized === null) return <div className="p-8"><p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p></div>;
  if (!authorized) return (
    <div className="p-8">
      <h1 className="text-3xl text-white mb-2" style={{ fontFamily: "var(--font-playfair)" }}>Staff</h1>
      <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Only the Manager can manage staff.</p>
    </div>
  );

  const roleBadge = (r: string) =>
    r === "manager" ? "border-white/25 text-white/60" :
    r === "designer" ? "border-blue-400/30 text-blue-300/70" :
    "border-amber-400/30 text-amber-300/70";

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Staff</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Managers, designers, and project managers who can sign in to the dashboard.</p>
        </div>
        <button onClick={() => { setShowForm(!showForm); setError(""); }}
          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ Add Staff</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-white/[0.08] bg-[#161616] p-6 mb-6 max-w-lg">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW STAFF MEMBER</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Name</label>
              <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Sara Al-Otaibi"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Phone (login)</label>
                <input required value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                  placeholder="05xxxxxxxx"
                  className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                  style={{ fontFamily: "var(--font-inter)" }} />
              </div>
              <div>
                <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Password</label>
                <input required value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                  className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                  style={{ fontFamily: "var(--font-inter)" }} />
              </div>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Role</label>
              <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                className="w-full bg-[#161616] border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                style={{ fontFamily: "var(--font-inter)" }}>
                {ROLES.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
            </div>
          </div>
          {error && <p className="text-red-400/70 text-xs mt-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-inter)" }}>{saving ? "Adding..." : "Add Staff"}</button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
          </div>
        </form>
      )}

      {staff.length === 0 ? (
        <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No staff yet.</p>
      ) : (
        <div className="border border-white/[0.08] bg-[#161616]">
          {staff.map((s, i) => (
            <div key={s.id} className={`flex items-center justify-between px-5 py-4 ${i < staff.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold" style={{ fontFamily: "var(--font-inter)" }}>{(s.name?.[0] ?? "?").toUpperCase()}</div>
                <div>
                  <p className="text-white/80 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{s.name}</p>
                  <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-xs px-2.5 py-1 border ${roleBadge(s.role)}`} style={{ fontFamily: "var(--font-inter)" }}>{roleLabel(s.role)}</span>
                {s.phone !== "0547080147" && (
                  <button onClick={() => remove(s.id)} disabled={deleting === s.id}
                    className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30" title="Remove">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
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
