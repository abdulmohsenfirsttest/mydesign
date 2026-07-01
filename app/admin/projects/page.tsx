"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { getAdmin, type AdminSession } from "@/lib/roles";

type Project = { id: string; name: string; stage: string; progress: number; started: string; budget: string; status: string; service: string | null; type: string | null; track: string | null; designer_id: string | null; pm_id: string | null; clients: { name: string } | null };
type Client = { id: string; name: string };
type Admin = { id: string; name: string; role: string };

const stages = ["Quotation", "Mood Board", "2D", "3D", "Plans", "Payment", "Delivery"];

const MANAGEMENT_SERVICE = "Renovation Planning & Construction Management";
const SERVICES: { group: string; track: "design" | "management"; items: string[] }[] = [
  { group: "Design", track: "design", items: ["Interior Design", "Exterior Design", "Landscape Design", "Interior & Exterior", "Full Package"] },
  { group: "Management", track: "management", items: [MANAGEMENT_SERVICE] },
];

const trackOf = (service: string) => (service === MANAGEMENT_SERVICE ? "management" : "design");

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [me, setMe] = useState<AdminSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ name: "", client_id: "", budget: "", started: new Date().toISOString().slice(0, 10), service: "", assignee_id: "" });
  const [deleting, setDeleting] = useState<string | null>(null);

  useEffect(() => {
    setMe(getAdmin());
    function fetchProjects() {
      Promise.all([
        supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false }),
        supabase.from("clients").select("id, name").order("name"),
        supabase.from("admins").select("id, name, role").order("name"),
      ]).then(([{ data: p }, { data: c }, { data: a }]) => {
        setProjects((p as typeof projects) ?? []);
        setClients(c ?? []);
        setAdmins((a as Admin[]) ?? []);
        setLoading(false);
      });
    }

    fetchProjects();

    const channel = supabase.channel("admin-projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchProjects)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  async function deleteProject(id: string) {
    if (!confirm("Delete this project? This cannot be undone.")) return;
    setDeleting(id);
    await supabase.from("projects").delete().eq("id", id);
    setProjects(prev => prev.filter(p => p.id !== id));
    setDeleting(null);
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSaving(true);
    const track = trackOf(form.service);
    const { data, error: err } = await supabase
      .from("projects")
      .insert({
        name: form.name,
        client_id: form.client_id,
        budget: form.budget,
        started: form.started,
        stage: "Quotation",
        progress: 0,
        status: "Active",
        service: form.service,
        type: form.service,
        track,
        designer_id: track === "design" ? (form.assignee_id || null) : null,
        pm_id: track === "management" ? (form.assignee_id || null) : null,
      })
      .select("*, clients(name)")
      .single();
    if (err) { setError(err.message); setSaving(false); return; }
    setProjects(prev => [data as Project, ...prev]);
    setForm({ name: "", client_id: "", budget: "", started: new Date().toISOString().slice(0, 10), service: "", assignee_id: "" });
    setSaving(false);
    setShowForm(false);
  }

  // Assignee pool for the create form: designers for a design service, PMs for the management service.
  const selectedTrack = trackOf(form.service);
  const assignPool = form.service === "" ? [] : admins.filter(a => a.role === (selectedTrack === "management" ? "project_manager" : "designer"));

  // Resolve the assignee name shown on a project card from the fetched admins list.
  const assigneeName = (p: Project) => {
    const id = p.track === "management" ? p.pm_id : p.designer_id;
    return id ? (admins.find(a => a.id === id)?.name ?? null) : null;
  };

  // Role-scoped visibility: managers see all; designers see only their own; PMs see management (or their own).
  const visible = projects.filter(p => {
    if (!me || me.role === "manager") return true;
    if (me.role === "designer") return p.designer_id === me.id;
    if (me.role === "project_manager") return p.track === "management" || p.pm_id === me.id;
    return true;
  });

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Projects</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All client projects and their current stages.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Project</button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="border border-white/[0.08] bg-[#161616] p-6 mb-6 max-w-lg">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW PROJECT</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Project Name</label>
              <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="e.g. Villa Interior — Al Nakheel"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Client</label>
              <select required value={form.client_id} onChange={e => setForm(f => ({ ...f, client_id: e.target.value }))}
                className="w-full bg-[#161616] border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select a client...</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Service</label>
              <select required value={form.service} onChange={e => setForm(f => ({ ...f, service: e.target.value, assignee_id: "" }))}
                className="w-full bg-[#161616] border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select a service...</option>
                {SERVICES.map(g => (
                  <optgroup key={g.group} label={g.group}>
                    {g.items.map(s => <option key={s} value={s}>{s}</option>)}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>{selectedTrack === "management" ? "Project Manager" : "Designer"}</label>
              {form.service === "" ? (
                <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Select a service first.</p>
              ) : assignPool.length === 0 ? (
                <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{selectedTrack === "management" ? "No project managers yet — add staff in Staff." : "No designers yet — add staff in Staff."}</p>
              ) : (
                <select required value={form.assignee_id} onChange={e => setForm(f => ({ ...f, assignee_id: e.target.value }))}
                  className="w-full bg-[#161616] border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  <option value="">Select {selectedTrack === "management" ? "a project manager" : "a designer"}...</option>
                  {assignPool.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}
                </select>
              )}
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Budget (optional)</label>
              <input value={form.budget} onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
                placeholder="e.g. SAR 420,000"
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20"
                style={{ fontFamily: "var(--font-inter)" }} />
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Start Date</label>
              <input type="date" required value={form.started} onChange={e => setForm(f => ({ ...f, started: e.target.value }))}
                className="w-full bg-transparent border border-white/15 text-white/80 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40"
                style={{ fontFamily: "var(--font-inter)", colorScheme: "dark" }} />
            </div>
          </div>
          {error && <p className="text-red-400/70 text-xs mt-3" style={{ fontFamily: "var(--font-inter)" }}>{error}</p>}
          <div className="flex gap-3 mt-5">
            <button type="submit" disabled={saving}
              className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors disabled:opacity-40"
              style={{ fontFamily: "var(--font-inter)" }}>{saving ? "Creating..." : "Create Project"}</button>
            <button type="button" onClick={() => { setShowForm(false); setError(""); }}
              className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors"
              style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
          </div>
        </form>
      )}

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : visible.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No projects yet. Click &quot;+ New Project&quot; to create one.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map(p => (
            <div key={p.id} className="border border-white/[0.08] bg-[#161616] p-6 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white/80 text-base mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</h2>
                  <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                    {p.clients?.name ?? "—"} · Started {p.started} · {p.budget || "No budget set"}
                  </p>
                  {(p.service || assigneeName(p)) && (
                    <p className="text-white/25 text-xs mt-0.5" style={{ fontFamily: "var(--font-inter)" }}>
                      {p.service || "—"}{assigneeName(p) ? ` · ${assigneeName(p)}` : ""}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {p.track === "management" && (
                    <span className="text-white/40 text-[10px] border border-white/15 px-2 py-1 tracking-widest uppercase" style={{ fontFamily: "var(--font-inter)" }}>Management</span>
                  )}
                  <span className="text-white/50 text-xs border border-white/15 px-2.5 py-1" style={{ fontFamily: "var(--font-inter)" }}>{p.stage}</span>
                  <button onClick={() => deleteProject(p.id)} disabled={deleting === p.id}
                    className="text-red-400/30 hover:text-red-400/70 transition-colors disabled:opacity-30 p-1" title="Delete project">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/></svg>
                  </button>
                </div>
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
      )}
    </div>
  );
}
