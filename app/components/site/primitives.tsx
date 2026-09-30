// Shared building blocks for the public brand site (v5.0.0, cloned from
// mydesign.sa). Sizes are taken from the Wix artwork at 1440px wide.
import Link from "next/link";
import type { ReactNode } from "react";

/** Page-width wrapper: content sits 72px in from the edge at 1440px. */
export function Container({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`mx-auto w-full max-w-[1440px] px-6 md:px-12 xl:px-[72px] ${className}`}>{children}</div>;
}

/** Small tracked uppercase label, e.g. "FROM BRIEF TO HANDOVER". Colour comes from the caller.
 *  9.5px / 0.25em matches every eyebrow in the art to within ±3px of width. */
export function Eyebrow({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <p className={`font-body text-[9.5px] uppercase leading-none tracking-[0.25em] ${className}`}>{children}</p>;
}

/** The thin → from the artwork (14×5px, 1px stroke). An SVG rather than the
 *  U+2192 glyph: DM Sans' latin subset does not include U+2192, so the glyph
 *  would fall back to a heavier, platform-dependent system arrow. */
export function ThinArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      width="14"
      height="8"
      viewBox="0 0 14 8"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={`shrink-0 ${className}`}
    >
      <path d="M0 4h13M10 1l3 3-3 3" />
    </svg>
  );
}

type Variant = "olive" | "cream" | "bronze";

// Olive and cream buttons are 53px tall in the art (Process 1154–1367 × 830–882;
// Closing 611–828 × 310–362), with 26px padding and a 26px gap before the arrow.
const VARIANTS: Record<Variant, string> = {
  // "Start with a brief →" (Process section)
  olive: "h-[53px] bg-site-olive text-site-cream hover:bg-[#636a53] font-body text-[15px] px-[26px]",
  // "Discuss a project →" (closing section)
  cream: "h-[53px] bg-site-cream text-site-ink hover:bg-white font-body text-[15px] px-[26px]",
  // "DISCUSS A PROJECT" (hero) — live Inter text on Wix, no arrow
  bronze:
    "bg-site-bronze text-[#111111] hover:bg-[#b99873] font-sans text-[11.25px] uppercase tracking-[0.1em] px-[45px] py-[18px]",
};

/** Rectangular CTA link. `arrow` appends the thin → used across the Wix artwork.
 *  Every ArrowButton sits on a dark section, so a cream focus ring shows on all three variants. */
export function ArrowButton({
  href,
  children,
  variant = "olive",
  arrow = variant !== "bronze",
  className = "",
}: {
  href: string;
  children: ReactNode;
  variant?: Variant;
  arrow?: boolean;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center leading-none transition-colors duration-200 focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-4 focus-visible:outline-site-cream ${VARIANTS[variant]} ${className}`}
    >
      <span>{children}</span>
      {arrow && <ThinArrow className="ml-[26px]" />}
    </Link>
  );
}
