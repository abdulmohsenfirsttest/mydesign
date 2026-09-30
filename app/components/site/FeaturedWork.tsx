// "Featured Work" strip, rebuilt from the Wix artwork (a flat 1440x358 PNG on
// mydesign.sa). At 1440: a 66px label bar (1px site-line underneath), then
// four equal full-bleed photo tiles, 292px tall, split by 1px site-line
// dividers. The tile scrim was measured off the art: the photo is darkened
// linearly from ~68% brightness at the top to ~12% at the bottom.
// Phones: the two labels stack, and the tiles form a 2x2 grid of taller tiles.
import Image from "next/image";
import { FEATURED_PROJECTS } from "./projects-data";
import { Container, Eyebrow } from "./primitives";

export default function FeaturedWork() {
  return (
    <section id="work" aria-labelledby="work-heading" className="bg-site-ink text-site-cream">
      <h2 id="work-heading" className="sr-only">
        Featured work
      </h2>

      <div className="border-b border-site-line">
        <Container className="flex min-h-[65px] flex-col items-start justify-center gap-2 py-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6 xl:py-0">
          {/* Visible label duplicates the sr-only h2 above, so it is hidden from assistive tech. */}
          <div aria-hidden="true">
            <Eyebrow className="text-site-cream">FEATURED WORK</Eyebrow>
          </div>
          {/* Smaller than the other eyebrows in the art: 194px wide, 6px cap height at 1440. */}
          <Eyebrow className="text-[8px]! tracking-[0.2em]! text-site-cream/80 sm:text-right">
            SPACES FOR A BRIGHTER TOMORROW.
          </Eyebrow>
        </Container>
      </div>

      {/* gap-px over a site-line background draws the 1px dividers in both layouts. */}
      <ul className="grid grid-cols-2 gap-px bg-site-line lg:grid-cols-4">
        {FEATURED_PROJECTS.map((project) => (
          <li key={project.slug} className="bg-site-ink">
            <a
              href="#selected-work"
              className="group relative block aspect-[4/5] overflow-hidden focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-site-cream sm:aspect-[359/292]"
            >
              {/* alt="": the link text names the project, and the same photo is described in Selected Work. */}
              <Image
                src={project.image.src}
                alt=""
                fill
                sizes="(min-width: 1024px) 25vw, 50vw"
                className="object-cover motion-safe:transition-transform motion-safe:duration-[1200ms] motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-linear-to-b from-black/32 to-black/88" />

              <span
                aria-hidden="true"
                className="absolute top-3 left-3 font-display text-[length:clamp(24px,2.22vw,32px)] leading-none sm:top-[14px] sm:left-[18px]"
              >
                {project.num}
              </span>

              <div className="absolute inset-x-3 bottom-4 sm:inset-x-[18px] sm:bottom-[19px]">
                <h3 className="font-display text-[length:clamp(19px,1.8vw,26px)] leading-none font-normal">
                  {project.title}
                </h3>
                {/* 8px as in the art; 10px on phones, where 8px is unreadable. */}
                <p className="mt-[11px] font-body text-[8px] leading-[12px] tracking-[0.2em] text-site-cream/85 uppercase max-sm:text-[10px] max-sm:leading-[14px]">
                  <span className="block">{project.featured.label}</span>
                  <span className="block">{project.featured.city}</span>
                </p>
              </div>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
