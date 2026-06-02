"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const nav = [
  { href: "/dashboard", label: "Overview", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" strokeWidth={1.5}/><rect x="14" y="3" width="7" height="7" strokeWidth={1.5}/><rect x="3" y="14" width="7" height="7" strokeWidth={1.5}/><rect x="14" y="14" width="7" height="7" strokeWidth={1.5}/></svg>
  )},
  { href: "/dashboard/projects", label: "Projects", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z"/></svg>
  )},
  { href: "/dashboard/messages", label: "Messages", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/></svg>
  )},
  { href: "/dashboard/files", label: "Files", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"/></svg>
  )},
  { href: "/dashboard/financials", label: "Financial", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
  )},
  { href: "/dashboard/reviews", label: "Reviews", icon: (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
  )},
];

export default function DashboardSidebar() {
  const path = usePathname();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-56 bg-[#111] border-r border-white/[0.06] flex flex-col z-40">
      <div className="px-5 h-16 flex items-center border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full border border-white/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold" style={{ fontFamily: "var(--font-playfair)" }}>my</span>
          </div>
          <span className="text-white text-xs font-medium tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>Design & Build</span>
        </Link>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {nav.map(item => {
          const active = path === item.href || (item.href !== "/dashboard" && path.startsWith(item.href));
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
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white text-xs font-medium" style={{ fontFamily: "var(--font-inter)" }}>A</div>
          <div className="flex-1 min-w-0">
            <p className="text-white text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>Ahmed Al-Rashid</p>
            <p className="text-white/30 text-xs truncate" style={{ fontFamily: "var(--font-inter)" }}>Client</p>
          </div>
        </div>
        <Link href="/" className="flex items-center gap-3 px-3 py-2.5 text-white/30 hover:text-white/60 text-xs transition-colors" style={{ fontFamily: "var(--font-inter)" }}>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
          Sign out
        </Link>
      </div>
    </aside>
  );
}
