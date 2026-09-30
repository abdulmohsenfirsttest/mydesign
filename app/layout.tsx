import type { Metadata } from "next";
import { Playfair_Display, Inter, Instrument_Serif, DM_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// Public brand site (v5.0.0, cloned from mydesign.sa). Fonts were identified
// by rendering candidates against the Wix artwork:
//  - Newsreader (light, display optical size) — every section heading and serif
//    paragraph baked into the Wix section images ("font-display").
//  - Instrument Serif — only the hero line, which is live Instrument Serif text
//    on Wix ("font-hero").
//  - Playfair Display (loaded below for the portal) — the two Trust headings,
//    which use a high-contrast Didone in the artwork ("font-didone").
//  - DM Sans — body copy and labels.
// The portal and admin keep Playfair + Inter. next/font self-hosts everything —
// no external requests. Only the styles/weights the site uses are loaded.
// No `axes: ["opsz"]`: the artwork matches Newsreader at its default optical size
// (18), which is what Google Fonts serves when the opsz axis isn't requested.
const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  style: "normal",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: "normal",
});

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: "400",
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata: Metadata = {
  title: "MY DESIGN — Design & Build",
  description:
    "From idea to reality. Design, engineering, project management and construction from Riyadh, Saudi Arabia.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: the inline script below may set data-theme on
    // <html> before React hydrates; React should accept the DOM as-is.
    // data-scroll-behavior="smooth": since Next 16, Next only turns the CSS smooth
    // scrolling off during route changes when this is set (otherwise going from
    // the foot of / to /book animates a scroll back to the top).
    <html
      lang="en"
      className={`${playfair.variable} ${inter.variable} ${instrumentSerif.variable} ${dmSans.variable} ${newsreader.variable}`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Anti-FOUC: apply the saved theme before first paint. Dark is the
            default, so only a stored "light" needs to touch the DOM. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{if(localStorage.getItem("theme")==="light")document.documentElement.dataset.theme="light"}catch(e){}})()`,
          }}
        />
      </head>
      <body className="bg-background text-foreground antialiased">{children}</body>
    </html>
  );
}
