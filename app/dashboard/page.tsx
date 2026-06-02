"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Project = { id: string; name: string; stage: string; progress: number; status: string };

export default function DashboardPage() {
  const router = useRouter();
  const [clientName, setClientName] = useState("");
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = localStorage.getItem("client_id");
    const name = localStorage.getItem("client_name");
    if (!id) { router.push("/auth/login"); return; }
    setClientName(name ?? "");

    supabase
      .from("projects")
      .select("id, name, stage, progress, status")
      .eq("client_id", id)
      .then(({ data }) => {
        setProjects(data ?? []);
        setLoading(false);
      });
  }, [router]);

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
          Good morning{clientName ? `, ${clientName.split(" ")[0]}` : ""}
        </h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Here&apos;s what&apos;s happening with your projects.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        <div className="border border-white/[0.08] bg-[#161616] p-5">
          <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{projects.length}</p>
          <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Active Projects</p>
        </div>
        <div className="border border-white/[0.08] bg-[#161616] p-5">
          <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>
            {projects.filter(p => p.status === "Awaiting Approval").length}
          </p>
          <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Pending Approvals</p>
        </div>
        <div className="border border-white/[0.08] bg-[#161616] p-5">
          <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>0</p>
          <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Unread Messages</p>
        </div>
        <div className="border border-white/[0.08] bg-[#161616] p-5">
          <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>0</p>
          <p className="text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Files Shared</p>
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>YOUR PROJECTS</h2>
          <Link href="/dashboard/projects" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>View all →</Link>
        </div>

        {loading ? (
          <p className="text-white/20 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Loading...</p>
        ) : projects.length === 0 ? (
          <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
            <p className="text-white/30 text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
            <p className="text-white/15 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Your projects will appear here once your team sets them up.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {projects.map(p => (
              <Link key={p.id} href={`/dashboard/projects/${p.id}`}
                className="block border border-white/[0.08] bg-[#161616] p-5 hover:border-white/20 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
                    <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Stage: {p.stage}</p>
                  </div>
                  <span className={`text-xs px-2.5 py-1 border ${p.status === "Awaiting Approval" ? "border-white/30 text-white/60" : "border-white/10 text-white/30"}`}
                    style={{ fontFamily: "var(--font-inter)" }}>{p.status}</span>
                </div>
                <div className="h-px bg-white/[0.06] w-full mb-1">
                  <div className="h-px bg-white/40" style={{ width: `${p.progress}%` }} />
                </div>
                <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
