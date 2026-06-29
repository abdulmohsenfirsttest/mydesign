"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const nav = [
  { href: "/admin", label: "Overview", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" strokeWidth={1.5}/><rect x="14" y="3" width="7" height="7" strokeWidth={1.5}/><rect x="3" y="14" width="7" height="7" strokeWidth={1.5}/><rect x="14" y="14" width="7" height="7" strokeWidth={1.5}/></svg>
  )},
  { href: "/admin/clients", label: "Clients", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
  )},
  { href: "/admin/projects", label: "Projects", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
  )},
  { href: "/admin/bookings", label: "Bookings", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>
  )},
  { href: "/admin/messages", label: "Messages", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  )},
  { href: "/admin/quotes", label: "Quotes", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"/></svg>
  )},
  { href: "/admin/uploads", label: "Upload Files", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
  )},
];

export default function AdminSidebar() {
  const path = usePathname();
  const router = useRouter();

  function signOut() {
    localStorage.removeItem("admin_session");
    localStorage.removeItem("admin_id");
    localStorage.removeItem("admin_name");
    router.push("/auth/login");
  }

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#0f0f0f] border-r border-white/[0.06] flex flex-col z-40">
      <div className="px-5 h-16 flex items-center justify-between border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-white text-xs font-medium tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>Owner Dashboard</span>
        </Link>
        <span className="text-xs bg-white/10 text-white/50 px-2 py-0.5 rounded-sm" style={{ fontFamily: "var(--font-inter)" }}>Team</span>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = path === item.href || (item.href !== "/admin" && path.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs transition-colors rounded-sm ${active ? "text-white bg-white/[0.07]" : "text-white/40 hover:text-white/70 hover:bg-white/[0.04]"}`}
              style={{ fontFamily: "var(--font-inter)" }}>
              {item.icon}
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-white/[0.06]">
        <div className="flex items-center gap-3 px-3 py-2.5 mb-1">
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-bold" style={{ fontFamily: "var(--font-inter)" }}>A</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>Abdulmohsen</p>
            <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Owner</p>
          </div>
        </div>
        <button onClick={signOut} className="w-full flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white/60 text-xs transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign out
        </button>
      </div>
    </aside>
  );
}
