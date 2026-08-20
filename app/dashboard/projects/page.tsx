"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = { id: string; name: string; type: string; stage: string; progress: number; started: string; status: string };

const stages = ["Quotation", "Mood Board", "2D", "3D", "Payment", "Delivery"];

export default function ProjectsPage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("client_id");
    if (!id) { router.push("/auth/login"); return; }

    function fetchProjects() {
      supabase.from("projects").select("*").eq("client_id", id!)
        .then(({ data }) => { setProjects(data ?? []); setLoading(false); });
    }

    fetchProjects();

    const channel = supabase.channel("client-projects")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects", filter: `client_id=eq.${id}` }, fetchProjects)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [router]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-foreground mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Projects</h1>
        <p className="text-muted-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All your ongoing and completed design projects.</p>
      </div>

      {loading ? (
        <p className="text-muted-4 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
      ) : projects.length === 0 ? (
        <div className="border border-soft bg-surface p-12 text-center">
          <p className="text-muted-3 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No projects yet. Your team will add them here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map(p => (
            <Link key={p.id} href={`/dashboard/projects/${p.id}`}
              className="block border border-soft bg-surface p-6 hover:border-border transition-colors">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-5">
                <div>
                  <h2 className="text-foreground text-base mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{p.name}</h2>
                  <p className="text-muted-3 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{p.type} · Started {p.started}</p>
                </div>
                <span className={`text-xs px-3 py-1.5 border self-start whitespace-nowrap ${p.status === "Awaiting Approval" ? "border-strong text-muted-1" : "border-border text-muted-2"}`}
                  style={{ fontFamily: "var(--font-inter)" }}>{p.status}</span>
              </div>
              <div className="flex items-center gap-0 mb-3">
                {stages.map((s, i) => {
                  const stageIdx = stages.indexOf(p.stage);
                  const done = i < stageIdx;
                  const active = i === stageIdx;
                  return (
                    <div key={s} className="flex items-center flex-1">
                      <div className={`flex-1 h-px ${done || active ? "bg-muted-2" : "bg-fill"}`} />
                      <div className={`w-2 h-2 rounded-full mx-1 ${active ? "bg-foreground" : done ? "bg-muted-2" : "bg-fill"}`} />
                      {i === stages.length - 1 && <div className={`flex-1 h-px ${done ? "bg-muted-2" : "bg-fill"}`} />}
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-muted-4 mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                {stages.map(s => <span key={s} className={s === p.stage ? "text-muted-1" : ""}>{s}</span>)}
              </div>
              <div className="h-px bg-border-soft w-full mb-1">
                <div className="h-px bg-muted-2" style={{ width: `${p.progress}%` }} />
              </div>
              <p className="text-muted-4 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
