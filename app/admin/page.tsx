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

    function fetchAll() {
      Promise.all([
        supabase.from("projects").select("id, name, stage, progress, client_id, clients(name)"),
        supabase.from("clients").select("id", { count: "exact", head: true }),
        supabase.from("bookings").select("id, time, name, service").eq("date", today).order("time"),
      ]).then(([{ data: proj }, { count }, { data: book }]) => {
        setProjects((proj as unknown as typeof projects) ?? []);
        setStats(s => ({ ...s, projects: proj?.length ?? 0, clients: count ?? 0 }));
        setBookings(book ?? []);
      });
    }

    fetchAll();

    const channel = supabase.channel("admin-overview")
      .on("postgres_changes", { event: "*", schema: "public", table: "bookings" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, fetchAll)
      .on("postgres_changes", { event: "*", schema: "public", table: "clients" }, fetchAll)
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, []);

  return (
    <div className="p-8">
      <div className="mb-8 flex items-start justify-between">
        <div>
          <h1 className="text-3xl text-foreground mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Admin Dashboard</h1>
          <p className="text-muted-1 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Welcome back, Abdulmohsen</p>
        </div>
        <Link href="/admin/clients" className="px-5 py-2.5 border border-foreground text-foreground text-xs tracking-widest hover:bg-foreground hover:text-background transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}>+ New Client</Link>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
        {[
          { label: "Active Projects", value: stats.projects },
          { label: "Total Clients", value: stats.clients },
          { label: "Bookings Today", value: bookings.length },
        ].map(s => (
          <div key={s.label} className="border border-soft bg-surface p-5">
            <p className="text-3xl text-foreground font-light mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{s.value}</p>
            <p className="text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>ACTIVE PROJECTS</h2>
            <Link href="/admin/projects" className="text-muted-2 text-xs hover:text-muted-1 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>View all →</Link>
          </div>
          {projects.length === 0 ? (
            <div className="border border-soft bg-surface p-10 text-center">
              <p className="text-muted-2 text-sm" style={{ fontFamily: "var(--font-inter)" }}>No projects yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {projects.map(p => (
                <div key={p.id} className="border border-soft bg-surface p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-muted-1 text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
                      <p className="text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                        {p.clients?.name ?? "—"} · {p.stage}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-fill">
                    <div className="h-px bg-muted-1" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="text-muted-2 text-xs mt-1" style={{ fontFamily: "var(--font-inter)" }}>{p.progress}% complete</p>
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-foreground text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>TODAY&apos;S BOOKINGS</h2>
            <Link href="/admin/bookings" className="text-muted-2 text-xs hover:text-muted-1 transition-colors" style={{ fontFamily: "var(--font-inter)" }}>All →</Link>
          </div>
          <div className="border border-soft bg-surface">
            {bookings.length === 0 ? (
              <p className="px-5 py-6 text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>No bookings today.</p>
            ) : bookings.map((b, i) => (
              <div key={b.id} className={`px-5 py-4 ${i < bookings.length - 1 ? "border-b border-soft" : ""}`}>
                <p className="text-foreground text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.time}</p>
                <p className="text-muted-2 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{b.name}</p>
                <p className="text-muted-2 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{b.service}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h2 className="text-foreground text-sm tracking-widest mb-4" style={{ fontFamily: "var(--font-inter)" }}>QUICK ACTIONS</h2>
            <div className="space-y-2">
              {[
                { label: "Manage Clients", href: "/admin/clients" },
                { label: "View Bookings", href: "/admin/bookings" },
                { label: "Meeting Logs", href: "/admin/messages" },
                { label: "Upload Files", href: "/admin/uploads" },
              ].map(a => (
                <Link key={a.href} href={a.href}
                  className="flex items-center justify-between px-4 py-3 border border-soft text-muted-1 text-xs hover:border-border hover:text-muted-1 transition-colors"
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
