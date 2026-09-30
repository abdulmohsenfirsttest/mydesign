// "Our Process." — rebuilt from the Wix section artwork (a flat 1440px PNG on
// mydesign.sa). Sizes/offsets below are read off that art at 1440px; the
// exact values apply from xl up, smaller screens get a scaled rhythm. Full-width
// 1px hairlines close the section top and bottom (y 33 and 1012 in the art).
import { ArrowButton, Container, Eyebrow } from "./primitives";

const STEPS = [
  {
    n: "01",
    title: "Understand",
    body: "We listen, visit the site and define what success means before design begins.",
    tags: "BRIEF / SITE / BUDGET / PROGRAMME",
  },
  {
    n: "02",
    title: "Imagine",
    body: "We turn the brief into a spatial idea with a distinct experience, material language and direction.",
    tags: "CONCEPT / EXPERIENCE / MATERIALS",
  },
  {
    n: "03",
    title: "Resolve",
    body: "Design and engineering come together. Details, cost, coordination and approvals become buildable information.",
    tags: "TECHNICAL DESIGN / COORDINATION / COST",
  },
  {
    n: "04",
    title: "Deliver",
    body: "We manage procurement, construction, quality and handover while protecting the original intent.",
    tags: "BUILD / QUALITY / HANDOVER",
  },
] as const;

export default function Process() {
  return (
    <section
      id="process"
      aria-labelledby="process-heading"
      className="border-y border-site-line bg-site-ink-deep pt-20 pb-24 text-site-cream md:pt-28 md:pb-28 xl:pt-[134px] xl:pb-[130px]"
    >
      <Container>
        {/* Header: title left, intro right (the right column starts at x=868 at 1440). */}
        <div className="lg:grid lg:grid-cols-[minmax(0,1.592fr)_minmax(0,1fr)] lg:items-start">
          <div>
            <Eyebrow className="text-site-cream">FROM BRIEF TO HANDOVER</Eyebrow>
            <h2
              id="process-heading"
              className="mt-[14px] font-display text-[length:clamp(64px,7.64vw,110px)] leading-[0.78] font-normal tracking-[-0.03em]"
            >
              Our
              <br />
              Process.
            </h2>
          </div>

          <div className="mt-12 border-l border-site-line pl-6 md:pl-[34px] lg:mt-[60px] lg:min-h-[149px]">
            <h3 className="font-display text-[length:clamp(32px,3.06vw,44px)] leading-[0.85] font-normal tracking-[-0.01em]">
              Clarity at every step.
            </h3>
            <p className="mt-[23px] font-display text-[length:clamp(17px,1.32vw,19px)] leading-[1.55] text-site-cream/80">
              A connected path from the first conversation to a finished space. Every stage has a purpose, a
              decision and a clear outcome.
            </p>
          </div>
        </div>

        {/* Four stages in one bordered row. gap-px over a site-line background draws the dividers
            in every layout (1 col → 2×2 → 4 across). */}
        <ol className="mt-14 grid grid-cols-1 gap-px border border-site-line bg-site-line md:grid-cols-2 xl:mt-[60px] xl:grid-cols-4">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="flex flex-col bg-site-ink-deep px-6 pt-[25px] pb-[31px] md:px-[26px] xl:min-h-[364px]"
            >
              <div className="pb-10">
                <p aria-hidden="true" className="font-display text-[30px] leading-none text-site-cream/80">
                  {step.n}
                </p>
                <h3 className="mt-10 font-display text-[length:clamp(34px,3.06vw,44px)] leading-none font-normal tracking-[-0.01em] xl:mt-[51px]">
                  {step.title}
                </h3>
                <p className="mt-[27px] font-body text-[13.5px] leading-[1.7] text-site-cream/75">{step.body}</p>
              </div>

              <p className="mt-auto border-t border-site-line pt-[28px] font-body text-[9px] leading-none tracking-[0.1em] text-site-cream/70 uppercase">
                {step.tags}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-10 flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between xl:mt-[26px]">
          <p className="font-display text-[length:clamp(19px,1.46vw,21px)] leading-[1.3] text-site-cream/85">
            One team remains accountable throughout.
          </p>
          <ArrowButton variant="olive" href="/book">
            Start with a brief
          </ArrowButton>
        </div>
      </Container>
    </section>
  );
}
