"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

const links = [
  { href: "/", label: "Home" },
  { href: "/#services", label: "Services" },
  { href: "/projects", label: "Projects" },
  { href: "/#contact", label: "Contact" },
];

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? "bg-[#0a0a0a]/95 backdrop-blur-sm" : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center">
            <span className="text-white font-bold text-sm" style={{ fontFamily: "var(--font-playfair)" }}>
              my
            </span>
          </div>
          <div className="leading-tight">
            <p className="text-white text-sm font-semibold tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
              Design &amp;
            </p>
            <p className="text-white text-sm font-semibold tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
              Build
            </p>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-white/80 hover:text-white transition-colors tracking-wide"
              style={{ fontFamily: "var(--font-inter)" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <Link
          href="/book"
          className="hidden md:inline-block px-5 py-2 border border-white text-white text-sm tracking-widest hover:bg-white hover:text-black transition-colors"
          style={{ fontFamily: "var(--font-inter)" }}
        >
          Book Now
        </Link>
      </div>
    </header>
  );
}
