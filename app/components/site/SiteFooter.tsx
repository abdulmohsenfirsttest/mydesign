// Public site footer (v5.0.0, cloned from mydesign.sa). On Wix this is a flat
// 1440x180 PNG shown 141px tall; rebuilt here as live text. The first grid
// column is 44% of the content width so the centre block starts at x≈643 at
// 1440, as in the artwork, whatever the rendered text widths. The right block is
// left-aligned (both lines start at x≈1249); the auto column ends it at x≈1368.
import Image from "next/image";
import { Container } from "./primitives";

// 8.5px / 0.12em: "RIYADH, SAUDI ARABIA" is 109px and "DESIGNED WITH INTENT." 117px in the art.
const label = "font-body text-[8.5px] uppercase leading-[14px] tracking-[0.12em] text-site-cream/85";

export default function SiteFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="bg-site-ink">
      <Container className="flex flex-col items-center gap-7 py-12 text-center md:grid md:min-h-[141px] md:grid-cols-[44%_1fr_auto] md:gap-0 md:py-6 md:text-left">
        <div className="flex flex-col items-center md:justify-self-start">
          {/* The mark alone (no ™), in site-cream as in the art: 32×34 at 1440. */}
          <Image src="/wix/logo-mark-cream.png" alt="" width={146} height={155} className="h-[34px] w-auto" />
          {/* pl balances the trailing letter-spacing so the mark centres on the glyphs */}
          <p className="mt-[7px] pl-[0.3em] font-body text-[9px] uppercase leading-none tracking-[0.3em] text-site-cream">
            MY DESIGN
          </p>
        </div>

        <div className={label}>
          <p>RIYADH, SAUDI ARABIA</p>
          {/* On /book this footer renders inside a client page, so the year is computed at build time
              and again in the browser; they differ only across New Year, which is not worth a mismatch. */}
          <p suppressHydrationWarning>© {year} MY DESIGN</p>
        </div>

        <div className={label}>
          <p>DESIGNED WITH INTENT.</p>
          <p>BUILT WITH CLARITY.</p>
        </div>
      </Container>
    </footer>
  );
}
