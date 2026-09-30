// Partners & clients — rebuilt from the Wix "Trust" artwork (flat PNGs on
// mydesign.sa). Two layouts:
// - xl+ (the 1440px desktop art, 1440×573): an 80px top bar, then the two
//   brochure spreads SIDE BY SIDE (720px each, 404px tall), then 89px of ground.
//   Spread 1 = text 205 | photo 229 | partner logos 286; spread 2 = heading over
//   the photo 314 (incl. the 1px hairline at x=720) | client logos 406.
//   Every size in this layout is an "art px" at 1440 written as
//   calc(N·cqw/14.4) against the 1440-max wrapper, so the band scales with the
//   viewport between 1280 and 1440 exactly like Wix's scaled PNG. The type is as
//   small as the art's (labels 5.5–6.5px, paragraphs 7.7–9px at 1440).
// - below xl: the taller stacked version of the art (spread 1 above spread 2),
//   sized for legibility.
// The brochure's "MY DESIGN" labels and page numbers (84–87) are left out on
// purpose.
import Image from "next/image";
import type { CSSProperties } from "react";
import { Container, Eyebrow } from "./primitives";

type Logo = { name: string; src: string; width: number; height: number };
type LogoGroup = { category: string; logos: readonly Logo[] };

// Every PNG is the mark plus 10px padding, on a flat #151614 (= bg-site-panel) ground.
const logo = (name: string, file: string, width: number, height: number): Logo => ({
  name,
  src: `/wix/trust/logos/${file}.png`,
  width,
  height,
});

const PARTNERS: readonly LogoGroup[] = [
  {
    category: "CONSULTANTS",
    logos: [logo("DAR", "dar", 138, 64), logo("SaudiConsult", "saudiconsult", 81, 92)],
  },
  {
    category: "SPECIALIST PARTNERS",
    logos: [
      logo("Richard Attias & Associates", "richard-attias-associates", 145, 60),
      logo("Conmarble", "conmarble", 87, 82),
      logo("Black", "black", 90, 91),
    ],
  },
  {
    category: "SUPPLIERS",
    logos: [
      logo("Workspace", "workspace", 153, 42),
      logo("Jeraisy Riyadh House", "jeraisy-riyadh-house", 91, 86),
      logo("Fantoni", "fantoni", 145, 51),
    ],
  },
  {
    category: "LOGISTICS & INTERNATIONAL OFFICES",
    logos: [
      logo("Prime Logistics", "prime-logistics", 134, 57),
      logo("MY Design Shanghai", "my-design-shanghai", 77, 83),
      logo("MY Design Hong Kong", "my-design-hong-kong", 81, 83),
    ],
  },
];

const CLIENTS: readonly LogoGroup[] = [
  {
    category: "GOVERNMENT",
    logos: [
      logo("Ministry of Culture", "ministry-of-culture", 144, 43),
      logo("Ministry of Sport", "ministry-of-sport", 137, 58),
      logo("Ministry of Municipalities and Housing", "ministry-of-municipalities-and-housing", 145, 55),
      logo("Ministry of Finance", "ministry-of-finance", 142, 65),
      logo("Ministry of Health", "ministry-of-health", 142, 55),
    ],
  },
  {
    category: "AUTHORITIES",
    logos: [
      logo("Museums Commission", "museums-commission", 117, 72),
      logo("Heritage Commission", "heritage-commission", 111, 72),
      logo("Film Commission", "film-commission", 94, 72),
      logo("Diriyah Biennale Foundation", "diriyah-biennale-foundation", 125, 71),
      logo("Music Commission", "music-commission", 103, 73),
    ],
  },
  {
    category: "SEMI-GOVERNMENT",
    logos: [
      logo("Red Sea Global", "red-sea-global", 79, 94),
      logo("GASCO", "gasco", 59, 94),
      logo("OSOOL", "osool", 134, 71),
      logo("Takamol", "takamol", 131, 77),
      logo("SELA", "sela", 81, 42),
    ],
  },
  {
    category: "CORPORATE",
    logos: [
      logo("Misk Foundation", "misk-foundation", 129, 75),
      logo("Black", "black", 90, 91),
      logo("RSCM", "rscm", 131, 66),
      logo("Granadia", "granadia", 131, 69),
      logo("Bidaya Albana Contracting", "bidaya-albana-contracting", 122, 85),
    ],
  },
  {
    category: "EDUCATION & CULTURAL",
    logos: [
      logo("Ministry of Education", "ministry-of-education", 97, 77),
      logo("Riyadh University of Arts", "riyadh-university-of-arts", 134, 87),
      logo("Afaq Academy for Fine Arts & Culture", "afaq-academy-for-fine-arts-culture", 138, 87),
      logo("Qurrah Day Care", "qurrah-day-care", 111, 86),
    ],
  },
];

// Phones: at most 3 logos per row (a 4th/5th wraps). md+: the whole group on one row.
const COLS: Record<number, string> = {
  2: "grid-cols-2",
  3: "grid-cols-3",
  4: "grid-cols-3 md:grid-cols-4",
  5: "grid-cols-3 md:grid-cols-5",
};

const RULE = "block h-px w-12 bg-site-cream/70";
const TRUSTED_BY_ALT = "Clients and the MyDesign team studying drawings and a scale model around a meeting table";
// Small labels at xl: 6.5 art px spread eyebrows, 5.5 art px closing labels.
const XL_EYEBROW = "xl:text-[length:calc(6.5cqw/14.4)] xl:tracking-[0.2em]";
const XL_FOOT = "xl:text-[length:calc(5.5cqw/14.4)] xl:tracking-[0.2em]";

/** One category: label, hairline, then equal cells split by thin vertical rules.
 *  Logos keep their relative sizes from the art: every file is drawn at the same
 *  fraction of its natural size (0.7 on phones, 0.62 at lg, 0.47 art px at xl as
 *  on Wix), never stretched, and shrinks only if a cell gets too narrow.
 *  `unoptimized` serves the PNG as-is so its #151614 ground stays an exact match
 *  for the panel. */
function LogoGroupRow({
  group,
  id,
  labelClass,
  rowClass,
  listClass,
}: {
  group: LogoGroup;
  id: string;
  labelClass: string;
  rowClass: string;
  listClass: string;
}) {
  const n = group.logos.length;
  return (
    <div>
      <Eyebrow className={`max-xl:leading-[1.6]! text-site-cream/70 ${labelClass}`}>
        <span id={id}>{group.category}</span>
      </Eyebrow>
      <ul aria-labelledby={id} className={`grid gap-y-4 border-t border-site-line ${COLS[n]} ${listClass}`}>
        {group.logos.map((item, i) => (
          <li
            key={item.src}
            className={`flex min-w-0 items-center justify-center border-site-line px-2 xl:px-[calc(2cqw/14.4)] ${rowClass} ${
              i % 3 === 0 ? "border-l-0" : "border-l"
            } ${n > 3 ? (i === 0 ? "md:border-l-0" : "md:border-l") : ""}`}
          >
            <Image
              src={item.src}
              alt={item.name}
              width={item.width}
              height={item.height}
              unoptimized
              style={{ "--logo-w": item.width } as CSSProperties}
              className="h-auto w-[calc(var(--logo-w)*0.7px)] max-w-full lg:w-[calc(var(--logo-w)*0.62px)] xl:w-[calc(var(--logo-w)*0.47cqw/14.4)]"
            />
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Trust() {
  return (
    <section
      id="trust"
      aria-labelledby="trust-heading"
      // #111210 is the closest token to the Wix band's #0E0F0E.
      className="bg-site-ink-deep pb-16 text-site-cream md:pb-20 xl:pb-[min(89px,6.1806vw)]"
    >
      {/* Top bar (80px, full-width hairline under it) — from the desktop art. */}
      <div className="border-b border-site-line">
        <Container className="flex flex-col gap-3 py-6 lg:h-[79px] lg:flex-row lg:items-center lg:justify-between lg:py-0">
          <Eyebrow className="max-xl:leading-[1.6]! text-site-cream">PARTNERSHIPS / CLIENTS / NATIONAL IMPACT</Eyebrow>
          <Eyebrow className="max-xl:leading-[1.6]! text-site-cream/70 xl:text-[8.5px] xl:tracking-[0.15em]">
            TRUSTED RELATIONSHIPS. LASTING VALUE.
          </Eyebrow>
        </Container>
      </div>

      {/* @container: at xl every size below is a fraction of this 1440-max wrapper. */}
      <div className="@container mx-auto max-w-[1440px]">
        <div className="xl:grid xl:grid-cols-2">
          {/* SPREAD 1 — text | photo | partner logos (360 | 500 | 580 stacked; 205 | 229 | 286 at xl). */}
          <div className="grid md:grid-cols-2 lg:grid-cols-[minmax(0,360fr)_minmax(0,500fr)_minmax(0,580fr)] xl:h-[calc(404cqw/14.4)] xl:grid-cols-[minmax(0,205fr)_minmax(0,229fr)_minmax(0,286fr)]">
            <div className="flex flex-col bg-site-panel px-6 pt-12 pb-10 md:px-12 lg:pr-6 lg:pl-10 xl:bg-black xl:pt-[calc(19cqw/14.4)] xl:pr-[calc(10cqw/14.4)] xl:pb-[calc(20cqw/14.4)] xl:pl-[calc(26cqw/14.4)]">
              <Eyebrow className={`text-site-cream ${XL_EYEBROW}`}>01 / BUILT ON TRUST</Eyebrow>
              <h2
                id="trust-heading"
                className="mt-10 font-didone text-[length:clamp(44px,4.44vw,64px)] leading-[0.98] font-normal xl:mt-[calc(40cqw/14.4)] xl:text-[length:calc(31.8cqw/14.4)] xl:leading-[1.005]"
              >
                Built
                <br />
                on Trust.
              </h2>
              <span
                aria-hidden="true"
                className="mt-7 block h-[2px] w-12 bg-site-cream xl:mt-[calc(22cqw/14.4)] xl:w-[calc(25cqw/14.4)]"
              />
              <p className="mt-9 font-body text-[17px] leading-[29px] text-site-cream/85 xl:mt-[calc(35cqw/14.4)] xl:text-[length:calc(9cqw/14.4)] xl:leading-[calc(14.5cqw/14.4)]">
                We work with leading <br className="hidden xl:inline" />
                consultants, specialists <br className="hidden xl:inline" />
                and trusted partners who <br className="hidden xl:inline" />
                share our belief in quality, <br className="hidden xl:inline" />
                craft and long-term value.
              </p>
              <Eyebrow className={`mt-auto pt-12 leading-[1.6]! text-site-cream/70 xl:pt-0 xl:leading-none! ${XL_FOOT}`}>
                PEOPLE / EXPERTISE / PROGRESS
              </Eyebrow>
            </div>

            <div className="relative aspect-[4/5] md:aspect-auto">
              <Image
                src="/wix/trust/built-on-trust.jpg"
                alt="A client in a red shemagh reviewing a scale model of a residential development, with partners joining on a video call"
                fill
                sizes="(min-width: 1440px) 229px, (min-width: 1280px) 16vw, (min-width: 1024px) 35vw, (min-width: 768px) 50vw, 100vw"
                className="object-cover xl:object-left"
              />
            </div>

            <div className="flex flex-col bg-site-panel px-6 pt-12 pb-10 md:col-span-2 md:px-12 lg:col-span-1 lg:pr-10 lg:pl-8 xl:pt-[calc(42cqw/14.4)] xl:pr-[calc(22cqw/14.4)] xl:pb-[calc(16cqw/14.4)] xl:pl-[calc(21cqw/14.4)]">
              <div className="space-y-10 xl:space-y-[calc(26cqw/14.4)]">
                {PARTNERS.map((group, i) => (
                  <LogoGroupRow
                    key={group.category}
                    id={`trust-partners-${i}`}
                    group={group}
                    labelClass="xl:text-[length:calc(6cqw/14.4)] xl:tracking-[0.2em]"
                    listClass="mt-3 pt-3 xl:mt-[calc(6.4cqw/14.4)] xl:pt-[calc(4cqw/14.4)]"
                    rowClass="min-h-[64px] xl:h-[calc(35cqw/14.4)] xl:min-h-0"
                  />
                ))}
              </div>
              <div className="mt-auto">
                <span aria-hidden="true" className={`mt-10 xl:mt-[calc(30cqw/14.4)] xl:w-[calc(25cqw/14.4)] ${RULE}`} />
                <Eyebrow className={`mt-6 leading-[1.6]! text-site-cream/70 xl:mt-[calc(21cqw/14.4)] xl:leading-none! ${XL_FOOT}`}>
                  A STRONGER TOMORROW, TOGETHER.
                </Eyebrow>
              </div>
            </div>
          </div>

          {/* SPREAD 2 — heading over the photo | client logos (626 | 814 stacked; 313 + 1px hairline | 406 at xl). */}
          <div className="grid lg:grid-cols-[minmax(0,626fr)_minmax(0,814fr)] xl:h-[calc(404cqw/14.4)] xl:grid-cols-[minmax(0,313fr)_minmax(0,406fr)] xl:border-l xl:border-site-line">
            {/* lg+: the text sits over the art's own photo, positioned in art px of this 313px-wide column
                (--k = one art px: column/313, i.e. 1440-wrapper/1440 at xl and twice that at lg). */}
            <div className="relative flex flex-col lg:min-h-[calc(404*var(--k))] lg:[--k:calc(1cqw/7.2)] xl:[--k:calc(1cqw/14.4)]">
              {/* The spread's photo, with the brochure's baked-in text retouched out: the standing man and
                  everyone at the table are whole, as in the art. Only one of the two photos is ever
                  displayed, so both carry the same alt text. */}
              <div className="absolute inset-x-0 top-0 hidden aspect-[646/831] lg:block xl:inset-0 xl:aspect-auto">
                <Image
                  src="/wix/trust/trusted-by-spread.jpg"
                  alt={TRUSTED_BY_ALT}
                  fill
                  sizes="(min-width: 1440px) 313px, (min-width: 1280px) 22vw, 44vw"
                  className="object-cover"
                />
                {/* lg: the column runs on below the photo, so its lower edge fades into the band. */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-site-ink-deep to-transparent to-20% xl:hidden"
                />
              </div>

              <div className="relative px-6 pt-14 md:px-12 lg:px-[calc(20*var(--k))] lg:pt-[calc(19*var(--k))]">
                <Eyebrow className="text-site-cream lg:text-[length:calc(6.5*var(--k))] lg:tracking-[0.2em]">
                  02 / TRUSTED BY
                </Eyebrow>
                <h2 className="mt-10 font-didone text-[length:clamp(44px,4.44vw,64px)] leading-[0.98] font-normal lg:mt-[calc(39*var(--k))] lg:text-[length:calc(25.6*var(--k))] lg:leading-[1.055]">
                  Trusted
                  <br />
                  By Visionaries.
                </h2>
                <span
                  aria-hidden="true"
                  className="mt-6 block h-[2px] w-12 bg-site-cream lg:mt-[calc(10.4*var(--k))] lg:h-px lg:w-[calc(24*var(--k))]"
                />
                <p className="mt-8 font-body text-[17px] leading-[29px] text-site-cream/85 lg:mt-[calc(17.9*var(--k))] lg:text-[length:calc(7.7*var(--k))] lg:leading-[calc(12*var(--k))]">
                  Public and private entities <br className="hidden lg:inline" />
                  that have trusted us to <br className="hidden lg:inline" />
                  deliver their vision.
                </p>
              </div>

              {/* Phones/tablets: a landscape crop of the same photo under the text; its top fades into
                  the band and the closing label sits over its darker lower edge. */}
              <div className="relative mt-8 aspect-[646/427] lg:hidden">
                <Image
                  src="/wix/trust/trusted-by.jpg"
                  alt={TRUSTED_BY_ALT}
                  fill
                  sizes="100vw"
                  className="object-cover object-[50%_40%]"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-b from-site-ink-deep to-transparent to-25%"
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-linear-to-t from-site-ink-deep/75 to-transparent to-40%"
                />
              </div>

              <Eyebrow className="absolute bottom-6 left-6 leading-[1.6]! text-site-cream/70 md:left-12 lg:bottom-[calc(20.8*var(--k))] lg:left-[calc(20*var(--k))] lg:text-[length:calc(5.5*var(--k))] lg:tracking-[0.2em] lg:leading-none!">
                TRUST / PARTNERSHIP / DELIVERY
              </Eyebrow>
            </div>

            <div className="flex flex-col bg-site-panel px-6 pt-12 pb-12 md:px-12 lg:pr-10 lg:pl-9 xl:pt-[calc(19cqw/14.4)] xl:pr-[calc(21cqw/14.4)] xl:pb-[calc(16cqw/14.4)] xl:pl-[calc(21cqw/14.4)]">
              <Eyebrow className={`max-xl:leading-[1.6]! text-site-cream/70 ${XL_EYEBROW}`}>
                SELECTED CLIENTS &amp; NATIONAL PARTNERS
              </Eyebrow>
              <div className="mt-6 space-y-8 xl:mt-[calc(9.5cqw/14.4)] xl:space-y-[calc(7.15cqw/14.4)]">
                {CLIENTS.map((group, i) => (
                  <LogoGroupRow
                    key={group.category}
                    id={`trust-clients-${i}`}
                    group={group}
                    labelClass="xl:text-[length:calc(5.5cqw/14.4)] xl:tracking-[0.12em]"
                    listClass="mt-3 pt-2 xl:mt-[calc(4.8cqw/14.4)] xl:pt-[calc(3cqw/14.4)]"
                    rowClass="min-h-[72px] xl:h-[calc(46cqw/14.4)] xl:min-h-0"
                  />
                ))}
              </div>
              <div className="mt-auto">
                <span aria-hidden="true" className={`mt-10 xl:mt-[calc(9cqw/14.4)] xl:w-[calc(24cqw/14.4)] ${RULE}`} />
                <Eyebrow className={`mt-6 max-xl:leading-[1.6]! text-site-cream/70 xl:mt-[calc(11cqw/14.4)] ${XL_FOOT}`}>
                  TRUSTED RELATIONSHIPS. LASTING VALUE.
                </Eyebrow>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
