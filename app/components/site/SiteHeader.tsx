"use client";

// Public site header (v5.0.0, cloned from mydesign.sa). Transparent over the
// home hero; solid + compact once scrolled or on any page without a hero.
// Desktop sizes are the live Wix header measured at 1440px wide.
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Container } from "./primitives";

const LINKS = [
  { href: "/", label: "Home" },
  { href: "/#work", label: "Work" },
  { href: "/#capabilities", label: "Capabilities" },
  { href: "/#process", label: "Process" },
  { href: "/#about", label: "About" },
  { href: "/#contact", label: "Contact" },
  { href: "/book", label: "Start a Project" },
];

const MENU_ID = "site-menu";
const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
const focusRing =
  "focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-site-cream";

export default function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  // Default matches the server render so there is no hydration mismatch; the
  // effect below upgrades it to a portal link once we can read localStorage.
  const [portal, setPortal] = useState({ href: "/auth/login", label: "Client Login" });
  const toggleRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    // A reload can restore a scrolled position before any scroll event fires.
    const raf = requestAnimationFrame(onScroll);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    // A returning visitor keeps their session (localStorage); show them the way
    // back into their portal instead of a Login button. Admin takes precedence.
    // localStorage is client-only, so this must run after mount — the default
    // state already matches the server render, so there's no hydration mismatch.
    // Reading localStorage throws when the browser blocks site data — fall back
    // to the logged-out button rather than crash the public page.
    let next: { href: string; label: string } | null = null;
    try {
      next = localStorage.getItem("admin_session")
        ? { href: "/admin", label: "Admin Panel" }
        : localStorage.getItem("client_id")
          ? { href: "/dashboard", label: "My Dashboard" }
          : null;
    } catch {}
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time sync from a client-only store
    if (next) setPortal(next);
  }, []);

  // Mobile menu: lock page scroll, focus the close button, trap Tab inside the
  // overlay, close on Escape, and close if the viewport grows to desktop.
  useEffect(() => {
    if (!open) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || !menuRef.current) return;
      const items = Array.from(menuRef.current.querySelectorAll<HTMLElement>(FOCUSABLE));
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const onDesktop = (e: MediaQueryListEvent) => {
      if (e.matches) setOpen(false);
    };

    document.addEventListener("keydown", onKey);
    desktop.addEventListener("change", onDesktop);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
      desktop.removeEventListener("change", onDesktop);
    };
  }, [open]);

  // Only the unscrolled home page has a hero behind the header.
  const overHero = pathname === "/" && !scrolled;

  const closeMenu = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <>
      <header
        className={`fixed inset-x-0 top-0 z-50 motion-safe:transition-colors motion-safe:duration-300 ${
          overHero ? "bg-transparent" : "bg-site-ink/95 backdrop-blur-md"
        }`}
      >
        <Container
          className={`flex items-center justify-between motion-safe:transition-[height] motion-safe:duration-300 ${
            overHero ? "h-24 lg:h-[150px] xl:h-[186px]" : "h-20"
          }`}
        >
          <Link href="/" className={`shrink-0 xl:ml-[67px] ${focusRing}`}>
            <Image
              src="/wix/logo-my-white.png"
              alt="My Design & Build"
              width={246}
              height={70}
              loading="eager"
              className={`h-auto motion-safe:transition-[width] motion-safe:duration-300 ${
                overHero ? "w-[168px] lg:w-[200px] xl:w-[246px]" : "w-[168px]"
              }`}
            />
          </Link>

          <nav
            aria-label="Main"
            className={`hidden lg:block motion-safe:transition-transform motion-safe:duration-300 ${
              overHero ? "xl:-translate-y-[9px]" : ""
            }`}
          >
            <ul className="flex items-center gap-4 font-sans text-[14px] leading-[1.4] xl:gap-[22.5px] xl:text-[15.75px]">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`whitespace-nowrap text-site-cream transition-opacity duration-200 hover:opacity-70 ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="flex items-center gap-4 xl:gap-[22.5px]">
                <span aria-hidden="true" className="h-4 w-px bg-site-line" />
                <Link
                  href={portal.href}
                  className={`whitespace-nowrap text-[13px] text-site-cream/60 transition-colors duration-200 hover:text-site-cream xl:text-[14px] ${focusRing}`}
                >
                  {portal.label}
                </Link>
              </li>
            </ul>
          </nav>

          <button
            ref={toggleRef}
            type="button"
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls={MENU_ID}
            onClick={() => setOpen(true)}
            className={`-mr-2.5 flex h-11 w-11 items-center justify-center text-site-cream lg:hidden ${focusRing}`}
          >
            <svg aria-hidden="true" width="26" height="14" viewBox="0 0 26 14" fill="none">
              <path d="M0 1h26M0 7h26M0 13h26" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
        </Container>
      </header>

      {/* Rendered outside <header>: its backdrop-filter would otherwise become
          the containing block for this fixed overlay. */}
      <div
        ref={menuRef}
        id={MENU_ID}
        role="dialog"
        aria-modal="true"
        aria-label="Site menu"
        hidden={!open}
        className="fixed inset-0 z-[60] flex flex-col overflow-y-auto bg-site-ink lg:hidden"
      >
        <Container className="flex h-24 shrink-0 items-center justify-between">
          <Link href="/" onClick={() => setOpen(false)} className={`shrink-0 ${focusRing}`}>
            <Image src="/wix/logo-my-white.png" alt="My Design & Build" width={246} height={70} className="h-auto w-[168px]" />
          </Link>
          <button
            ref={closeRef}
            type="button"
            aria-label="Close menu"
            onClick={closeMenu}
            className={`-mr-2.5 flex h-11 w-11 items-center justify-center text-site-cream ${focusRing}`}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M1 1l18 18M19 1L1 19" stroke="currentColor" strokeWidth="1.25" />
            </svg>
          </button>
        </Container>

        <Container className="flex flex-1 flex-col justify-center pt-4 pb-16">
          <nav aria-label="Mobile">
            <ul className="flex flex-col gap-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    aria-current={pathname === link.href ? "page" : undefined}
                    className={`font-display text-[40px] leading-[1.15] text-site-cream transition-opacity duration-200 hover:opacity-70 ${focusRing}`}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-10 border-t border-site-line pt-6">
              <Link
                href={portal.href}
                onClick={() => setOpen(false)}
                className={`font-body text-[13px] uppercase tracking-[0.2em] text-site-cream/60 transition-colors duration-200 hover:text-site-cream ${focusRing}`}
              >
                {portal.label}
              </Link>
            </div>
          </nav>
        </Container>
      </div>
    </>
  );
}
