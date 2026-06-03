"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Project = { id: string; name: string; stage: string; progress: number; started: string; budget: string; status: string; clients: { name: string } | null };

const stages = ["Quotation", "Mood Board", "2D", "3D", "Plans", "Payment", "Delivery"];

export default function AdminProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.from("projects").select("*, clients(name)").order("created_at", { ascending: false })
      .then(({ data }) => { setProjects((data as typeof projects) ?? []); setLoading(false); });
  }, []);

  return (
    <div className="p-8">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Projects</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All client projects and their current stages.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : projects.length === 0 ? (
        <div className="border border-white/[0.08] bg-[#161616] p-12 text-center">
          <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No projects yet. Add them from the Clients page.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {projects.map(p => (
            <div key={p.id} className="border border-white/[0.08] bg-[#161616] p-6 hover:border-white/20 transition-colors">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-white/80 text-base mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</h2>
                  <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                    {p.clients?.name ?? "—"} · Started {p.started} · {p.budget}
                  </p>
                </div>
                <span className="text-white/50 text-xs border border-white/15 px-2.5 py-1" style={{ fontFamily: "var(--font-inter)" }}>{p.stage}</span>
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
