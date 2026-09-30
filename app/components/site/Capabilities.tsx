// "One connected practice" — rebuilt from the Wix section artwork (a flat
// 1440px PNG on mydesign.sa). Measurements are read off that art at 1440px;
// the content block sits 15px inside the page container there (x 87 → 1353).
import Link from "next/link";
import { Container, Eyebrow } from "./primitives";

const CAPABILITIES = [
  {
    n: "01",
    title: "Design",
    body: "Architecture, interiors and spatial identity shaped around people, place and purpose.",
  },
  {
    n: "02",
    title: "Engineering",
    body: "Technical coordination that turns intent into clear, buildable information.",
  },
  {
    n: "03",
    title: "Project Management",
    body: "Programme, cost, quality and decisions managed with disciplined visibility.",
  },
  {
    n: "04",
    title: "Construction",
    body: "Careful execution from approved information through testing and handover.",
  },
] as const;

/** Thin ↗ used at the end of each row (13px glyph, 1px stroke). */
function NorthEastArrow({ className = "" }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 14 14"
      width="14"
      height="14"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      className={className}
    >
      <path d="M1 13 13 1M7 1h6v6" />
    </svg>
  );
}

export default function Capabilities() {
  return (
    <section
      id="capabilities"
      aria-labelledby="capabilities-heading"
      className="bg-site-cream pt-20 pb-24 text-site-ink md:pt-28 md:pb-28 xl:pt-[129px] xl:pb-[128px]"
    >
      <Container>
        <div className="lg:grid lg:grid-cols-[minmax(0,1.17fr)_minmax(0,1fr)] lg:items-start lg:gap-12 xl:px-[15px]">
          <div className="lg:pt-[2px]">
            <Eyebrow className="text-site-ink">ONE CONNECTED PRACTICE</Eyebrow>
            <h2
              id="capabilities-heading"
              className="mt-[17px] font-display text-[length:clamp(44px,5.83vw,84px)] leading-[0.95] font-normal tracking-[-0.025em] lg:leading-[0.875]"
            >
              The idea should <br className="hidden lg:inline" />
              survive all the <br className="hidden lg:inline" />
              way to reality.
            </h2>
            {/* 16px in a 525px measure: line 1 ends on "capability", as in the art. */}
            <p className="mt-8 max-w-[525px] font-body text-[length:clamp(15.5px,1.15vw,16px)] leading-[1.65] text-site-ink/65 lg:mt-[44px]">
              Engage us as one integrated team, or bring in the specialist capability your project needs.
            </p>
          </div>

          <ul className="mt-14 border-t border-site-line-cream lg:mt-0">
            {CAPABILITIES.map((item) => (
              <li key={item.n} className="border-b border-site-line-cream">
                <Link
                  href="/book"
                  className="group grid grid-cols-[36px_minmax(0,1fr)_auto] items-center gap-x-3 pt-5 pb-[21px] focus-visible:outline focus-visible:outline-1 focus-visible:outline-offset-2 focus-visible:outline-site-ink md:grid-cols-[49px_minmax(0,1fr)_auto] md:gap-x-0"
                >
                  <span
                    aria-hidden="true"
                    className="mt-px self-start font-body text-[9.5px] leading-none text-site-ink/55"
                  >
                    {item.n}
                  </span>
                  <div>
                    <h3 className="font-body text-[17px] leading-[1.3] font-normal text-site-ink/90 transition-colors duration-200 group-hover:text-site-ink">
                      {item.title}
                    </h3>
                    <p className="mt-1 font-body text-[13px] leading-[20px] text-site-ink/60">{item.body}</p>
                  </div>
                  <NorthEastArrow className="mr-[10px] ml-4 text-site-ink/85 transition-[color,transform] duration-200 group-hover:text-site-ink motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
