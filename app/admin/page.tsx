"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

export default function AdminPage() {
  const [stats, setStats] = useState({ projects: 0, clients: 0, bookings: 0 });
  const [projects, setProjects] = useState<{ id: string; name: string; stage: string; progress: number; clients: { name: string } | null }[]>([]);
  const [bookings, setBookings] = useState<{ id: string; time: string; name: string; service: string }[]>([]);

  useEffect(() => {
    const today = new Date().toISOString().split("T")[0];

    Promise.all([
      supabase.from("projects").select("id, name, stage, progress, client_id, clients(name)"),
      supabase.from("clients").select("id", { count: "exact", head: true }),
      supabase.from("bookings").select("id, time, name, service").eq("date", today).order("time"),
    ]).then(([{ data: proj }, { count }, { data: book }]) => {
      setProjects((proj as unknown as typeof projects) ?? []);
      setStats(s => ({ ...s, projects: proj?.length ?? 0, clients: count ?? 0 }));
      setBookings(book ?? []);
    });
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Admin Dashboard</h1>
          <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Welcome back, Abdulmohsen</p>
        </div>
        <Link href="/admin/clients" className="px-5 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Client</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Active Projects", value: stats.projects },
          { label: "Total Clients", value: stats.clients },
          { label: "Bookings Today", value: bookings.length },
        ].map(s => (
          <div key={s.label} className="border border-white/[0.08] bg-[#161616] p-5">
            <p className="text-3xl text-white font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{s.value}</p>
            <p className="text-white/50 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ACTIVE PROJECTS</h2>
            <Link href="/admin/projects" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="border border-white/[0.08] bg-[#161616] p-10 text-center">
              <p className="text-white/25 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="border border-white/[0.08] bg-[#161616] p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-white/80 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
                      <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                        {p.clients?.name ?? "—"} · {p.stage}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-white/[0.06]">
                    <div className="h-px bg-white/40" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-white/20 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TODAY&apos;S BOOKINGS</h2>
            <Link href="/admin/bookings" className="text-white/30 text-xs hover:text-white/60 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>All →</Link>
          </div>
          <div className="border border-white/[0.08] bg-[#161616]">
            {bookings.length === 0 ? (
              <p className="px-5 py-6 text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No bookings today.</p>
            ) : bookings.map((b, i) => (
              <div key={b.id} className={`px-5 py-4 ${i < bookings.length - 1 ? "border-b border-white/[0.06]" : ""}`}>
                <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</p>
                <p className="text-white/50 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.name}</p>
                <p className="text-white/25 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-white text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>QUICK ACTIONS</h2>
            <div className="space-y-2">
              {[
                { label: "Manage Clients", href: "/admin/clients" },
                { label: "View Bookings", href: "/admin/bookings" },
                { label: "Meeting Logs", href: "/admin/messages" },
                { label: "Upload Files", href: "/admin/uploads" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between px-4 py-3 border border-white/[0.08] text-white/40 text-xs hover:border-white/25 hover:text-white/70 transition-colors"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  {a.label}<span>→</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
