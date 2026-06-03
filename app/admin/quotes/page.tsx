"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Client = { id: string; name: string };
type Project = { id: string; name: string; client_id: string };

const statusStyle: Record<string, string> = {
  "Pending Signature": "border-white/40 text-white/60",
  "Signed": "border-white/15 text-white/30",
  "Draft": "border-white/10 text-white/20",
};

export default function QuotesPage() {
  const [showForm, setShowForm] = useState(false);
  const [lines, setLines] = useState([{ item: "", amount: "" }]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedClient, setSelectedClient] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    supabase.from("clients").select("id, name").then(({ data }) => setClients(data ?? []));
    supabase.from("projects").select("id, name, client_id").then(({ data }) => setProjects(data ?? []));
  }, []);

  const filteredProjects = selectedClient ? projects.filter(p => p.client_id === selectedClient) : projects;

  function addLine() { setLines(l => [...l, { item: "", amount: "" }]); }

  function handleSend(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
    setTimeout(() => { setSent(false); setShowForm(false); setLines([{ item: "", amount: "" }]); setSelectedClient(""); }, 2000);
  }

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Quotes & E-sign</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Create and send financial offers to clients.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)}
          className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Quote</button>
      </div>

      {showForm && (
        <form onSubmit={handleSend} className="border border-white/[0.08] bg-[#161616] p-6 mb-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>NEW QUOTE</h2>
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Client</label>
              <select required value={selectedClient} onChange={e => setSelectedClient(e.target.value)}
                className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select client</option>
                {clients.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Project</label>
              <select required className="w-full bg-[#1e1e1e] border border-white/15 text-white/70 text-xs px-3 py-3 focus:outline-none focus:border-white/40" style={{ fontFamily: "var(--font-inter)" }}>
                <option value="">Select project</option>
                {filteredProjects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
              </select>
            </div>
          </div>

          <h3 className="text-white/30 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>LINE ITEMS</h3>
          <div className="space-y-2 mb-3">
            {lines.map((line, i) => (
              <div key={i} className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <input required placeholder="Description" value={line.item}
                    onChange={e => { const l = [...lines]; l[i].item = e.target.value; setLines(l); }}
                    className="w-full bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20" style={{ fontFamily: "var(--font-inter)" }} />
                </div>
                <input required placeholder="SAR 0" value={line.amount}
                  onChange={e => { const l = [...lines]; l[i].amount = e.target.value; setLines(l); }}
                  className="bg-transparent border border-white/15 text-white/70 text-xs px-3 py-2.5 focus:outline-none focus:border-white/40 placeholder-white/20" style={{ fontFamily: "var(--font-inter)" }} />
              </div>
            ))}
          </div>
          <button type="button" onClick={addLine} className="text-white/25 text-xs hover:text-white/50 transition-colors mb-5" style={{ fontFamily: "var(--font-inter)" }}>+ Add line</button>

          <div className="flex gap-3">
            <button type="submit" className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
              {sent ? "✓ Sent to client" : "Send for Signature"}
            </button>
            <button type="button" onClick={() => setShowForm(false)} className="px-6 py-2.5 border border-white/15 text-white/30 text-xs hover:border-white/30 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>Cancel</button>
          </div>
        </form>
      )}

      <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
        <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No quotes yet. Create one using the button above.</p>
      </div>
    </div>
  );
}
