"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  // Default matches the server render so there is no hydration mismatch; the
  // effect below upgrades it to a portal link once we can read localStorage.
  const [portal, setPortal] = useState({ href: "/auth/login", label: "Client Login" });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    // A returning visitor keeps their session (localStorage); show them the way
    // back into their portal instead of a Login button. Admin takes precedence.
    // localStorage is client-only, so this must run after mount — the default
    // state already matches the server render, so there's no hydration mismatch.
    const next = localStorage.getItem("admin_session")
      ? { href: "/admin", label: "Admin Panel" }
      : localStorage.getItem("client_id")
        ? { href: "/dashboard", label: "My Dashboard" }
        : null;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from a client-only store
    if (next) setPortal(next);
  }, []);

  // Over the homepage hero (unscrolled, transparent header on a dark photo) the
  // text must stay white in BOTH themes — a photographic-overlay exception, same
  // as the hero headline. Everywhere else the semantic tokens apply.
  const overHero = usePathname() === "/" && !scrolled;
  const cPrimary = overHero ? "text-white" : "text-foreground";
  const cRing = overHero ? "border-white" : "border-foreground";
  const cLink = overHero ? "text-white/80 hover:text-white" : "text-muted-1 hover:text-foreground";
  const cPortal = overHero ? "text-white/60 hover:text-white" : "text-muted-2 hover:text-foreground";
  const cCta = overHero
    ? "border-white text-white hover:bg-white hover:text-black"
    : "border-foreground text-foreground hover:bg-foreground hover:text-background";

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-background/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className={`w-9 h-9 rounded-full border-2 ${cRing} flex items-center justify-center`}>
            <span className={`${cPrimary} font-bold text-sm`} style={{ fontFamily: "var(--font-playfair)" }}>
              my
            </span>
          </div>
          <div className="leading-tight">
            <p className={`${cPrimary} text-sm font-semibold tracking-wide`} style={{ fontFamily: "var(--font-inter)" }}>
              Design &amp;
            </p>
            <p className={`${cPrimary} text-sm font-semibold tracking-wide`} style={{ fontFamily: "var(--font-inter)" }}>
              Build
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm ${cLink} transition-colors tracking-wide`}
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle className={overHero ? "text-white/70 hover:text-white" : undefined} />
          <Link
            href={portal.href}
            className={`text-sm ${cPortal} transition-colors`}
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {portal.label}
          </Link>
          <Link
            href="/book"
            className={`px-5 py-2 border ${cCta} text-sm tracking-widest transition-colors`}
            style={{ fontFamily: "var(--font-inter)" }}
          >
            Book Now
          </Link>
        </div>
      </div>
    </header>
  );
}
