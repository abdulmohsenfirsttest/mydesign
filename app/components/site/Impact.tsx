// "A Growing Impact." — rebuilt from the Wix section artwork (a flat 1440×852
// PNG on mydesign.sa). Left half (x 0→835): the site photo with the heading
// over it. Right half (x 835→1440): the numbers panel. A full-width 1px hairline
// closes the section (y=850 in the art). Sizes and offsets are read off that
// art at 1440px and apply from xl up; below lg the photo block (with its text)
// stacks above the numbers panel.
import Image from "next/image";
import { Eyebrow } from "./primitives";

type Stat = { value: string; label: string; sub: string };

// Row 1 is a single cell with the label ABOVE the value; rows 2–4 put the value
// first, then label, then sub-line (exactly as in the art).
const ESTABLISHED: Stat = { value: "2016", label: "ESTABLISHED", sub: "Founded in Riyadh" };

const PAIRS: readonly (readonly [Stat, Stat])[] = [
  [
    { value: "100,000+", label: "SQUARE METRES", sub: "Designed & delivered" },
    { value: "100+", label: "COMPLETED PROJECTS", sub: "Delivered" },
  ],
  [
    { value: "100+", label: "CLIENTS", sub: "Government, corporate & private" },
    { value: "6+", label: "SECTORS SERVED", sub: "Diverse project expertise" },
  ],
];

const PROJECT_VALUE: Stat = { value: "SAR 300M+", label: "PROJECT VALUE", sub: "Delivered portfolio" };

// Each cell is 122px tall at 1440 (hairlines at y 274/396/518/640/762 in the art).
const CELL = "flex min-h-[122px] flex-col border-b border-site-line";
// 37px: the numerals in the art are 27px tall. "100,000+" is ~4em wide, so the size
// scales down where a half-width cell is narrower than that (phones, and the
// lg panel before xl) instead of running into the right-hand stat.
const VALUE =
  "font-display text-[length:clamp(30px,9.4vw,37px)] leading-none font-normal text-site-cream lg:text-[length:clamp(30px,2.9vw,37px)]";
const LABEL = "font-body text-[8.5px] leading-none tracking-[0.25em] text-site-bronze uppercase";
const SUB = "font-body text-[10px] leading-[12px] text-site-cream/70";

/** Rows 2–4: value, then label, then sub. The <dt> stays first in the DOM (valid
 *  <dl> grouping, and screen readers hear "Square metres, 100,000+"); CSS order
 *  puts the value on top visually. */
function StatCell({ stat, className }: { stat: Stat; className: string }) {
  return (
    <div className={`${CELL} pt-[27px] pb-6 ${className}`}>
      <dt className={`mt-[11px] ${LABEL}`}>{stat.label}</dt>
      <dd className={`order-first ${VALUE}`}>{stat.value}</dd>
      <dd className={`mt-px ${SUB}`}>{stat.sub}</dd>
    </div>
  );
}

export default function Impact() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-b border-site-line bg-site-ink text-site-cream lg:grid lg:grid-cols-[minmax(0,835fr)_minmax(0,605fr)] xl:min-h-[852px]"
    >
      {/* LEFT — photo with the heading over it (stacked: text, then photo, below lg). */}
      <div className="relative isolate">
        <div className="relative z-10 px-6 pt-16 pb-10 md:px-12 lg:pt-[96px] lg:pb-16 xl:px-[72px] xl:pt-[105px]">
          <Eyebrow className="text-site-cream/85">04 / A GROWING IMPACT</Eyebrow>
          <h2
            id="about-heading"
            className="mt-6 font-display text-[length:clamp(52px,5.7vw,82px)] leading-[0.88] font-normal tracking-[-0.03em] xl:mt-[30px]"
          >
            A Growing
            <br />
            Impact.
          </h2>
          <p className="mt-8 max-w-[300px] font-body text-[17px] leading-[31px] text-site-cream lg:mt-12 xl:mt-[62px]">
            A Saudi practice with an <br className="hidden lg:inline" />
            international outlook, delivering <br className="hidden lg:inline" />
            spaces that create lasting value.
          </p>
        </div>

        {/* The photo (library original, rows 62–1410 of 900×1600) is framed like Wix: at 1440 it
            starts at x≈228 of the 835px panel, with the team lower-centre under the vaulted arches.
            Wix fills the band left of it with an AI extension of the scene; here that band is plain
            ink and the photo's left edge fades into it, so the heading and paragraph sit on dark
            ground as on Wix. A 25% ink tint approximates Wix's darker grade. */}
        <div className="relative aspect-[4/5] w-full overflow-hidden md:aspect-[835/852] lg:absolute lg:inset-0 lg:aspect-auto">
          <div className="absolute inset-0 lg:left-[18%] xl:left-[27.3%]">
            <Image
              src="/wix/impact/team-on-site.jpg"
              alt="MyDesign site team in hard hats and branded high-visibility vests walking a scaffolded building under construction"
              fill
              sizes="(min-width: 1280px) 42vw, (min-width: 1024px) 48vw, 100vw"
              className="object-cover object-[50%_100%] lg:object-[70%_100%]"
            />
            <div aria-hidden="true" className="absolute inset-0 bg-site-ink/25" />
            {/* lg+: the photo's left edge fades into the ink band the heading sits on. */}
            <div
              aria-hidden="true"
              className="absolute inset-y-0 left-0 hidden w-[18%] bg-linear-to-r from-site-ink to-transparent lg:block"
            />
          </div>
          {/* Phones/tablets: fade the photo's top edge into the text block above it. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-linear-to-b from-site-ink to-transparent to-30% lg:hidden"
          />
        </div>
      </div>

      {/* RIGHT — numbers panel. Content starts at x 893 and the stats block runs 893→1382 at 1440. */}
      <div className="bg-site-panel px-6 pt-16 pb-20 md:px-12 lg:px-10 lg:pt-[86px] lg:pb-[90px] xl:px-[58px]">
        <Eyebrow className="text-site-cream/85">BY THE NUMBERS</Eyebrow>
        <h3 className="mt-5 font-display text-[length:clamp(40px,3.89vw,56px)] leading-[0.92] font-normal tracking-[-0.02em] xl:mt-[22px]">
          Built for a
          <br />
          wider reach.
        </h3>

        {/* Hairlines top/between/bottom; the 1px right edge runs down rows 1–3 only, like the art. */}
        <dl className="mt-12 grid grid-cols-2 border-t border-site-line xl:mt-[52px]">
          <div className={`${CELL} col-span-2 border-r pt-[23px] pb-6`}>
            <dt className={LABEL}>{ESTABLISHED.label}</dt>
            <dd className={`mt-[6px] ${VALUE}`}>{ESTABLISHED.value}</dd>
            <dd className={`mt-[11px] ${SUB}`}>{ESTABLISHED.sub}</dd>
          </div>

          {PAIRS.map(([left, right]) => (
            <StatPair key={left.label} left={left} right={right} />
          ))}

          <StatCell stat={PROJECT_VALUE} className="col-span-2 md:pl-5" />
        </dl>
      </div>
    </section>
  );
}

/** Two cells side by side: the first is inset 20px (from md; phones keep it flush
 *  with "2016" for room), the second starts at the block's midpoint. */
function StatPair({ left, right }: { left: Stat; right: Stat }) {
  return (
    <>
      <StatCell stat={left} className="pr-3 md:pl-5" />
      <StatCell stat={right} className="border-r pr-3" />
    </>
  );
}
