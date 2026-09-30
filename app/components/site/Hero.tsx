// Home hero (v5.0.0, cloned from mydesign.sa). Full-bleed looping video under
// a black scrim, the page's only <h1>. Positions are the live Wix hero at
// 1440px wide (812px tall, h1 at y≈180, sub-line y≈415, CTA y≈495, x≈232); type
// and spacing scale with the viewport like Wix does, clamped for phones.
import { ArrowButton, Container } from "./primitives";

export default function Hero() {
  return (
    <section
      id="home"
      aria-labelledby="home-title"
      // Reduced motion: the video is hidden and the poster frame is painted as
      // the section background instead (same URL as the video poster, so it
      // is fetched once).
      className="relative isolate flex min-h-[90svh] items-center overflow-hidden bg-site-ink pt-24 pb-16 motion-reduce:bg-[url(/wix/hero-poster.jpg)] motion-reduce:bg-cover motion-reduce:bg-center lg:block lg:h-[clamp(600px,56.4vw,812px)] lg:min-h-0 lg:pt-[clamp(140px,12.5vw,180px)] lg:pb-0"
    >
      {/* The <source> media query keeps reduced-motion browsers from even
          loading the clip — with no playable source the element shows only
          its poster. motion-reduce:hidden covers browsers that ignore it. */}
      <video
        aria-hidden="true"
        tabIndex={-1}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        poster="/wix/hero-poster.jpg"
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full object-cover motion-reduce:hidden"
      >
        <source src="/wix/hero.mp4" type="video/mp4" media="(prefers-reduced-motion: no-preference)" />
      </video>
      <div aria-hidden="true" className="absolute inset-0 -z-10 bg-black/50" />

      <Container>
        <div className="xl:pl-[18px]">
          {/* Below 1024 Wix scales the h1 at 9.23vw (36px on a 390px phone). */}
          <h1
            id="home-title"
            className="max-w-[6.55em] font-hero text-[clamp(36px,9.23vw,72px)] leading-[1.05] text-site-cream lg:text-[clamp(52px,7.1875vw,103.5px)]"
          >
            From idea to reality.
          </h1>
          <p className="mt-[clamp(14px,1.25vw,18px)] font-sans text-[clamp(17px,1.5625vw,22.5px)] leading-[1.4] text-site-cream">
            Design. Engineering. Project Management. Construction.
          </p>
          {/* The Wix button is indented from the h1: margin-left 16.09375% vs the h1's 6.25% on
              desktop (x≈232 at 1440), 17.45% vs 6.15% on phones (x≈68 at 390). */}
          <div className="mt-[clamp(32px,3.37vw,48.5px)] ml-[calc(17.45vw-24px)] md:ml-[calc(17.45vw-48px)] lg:ml-[min(9.84375vw,141.75px)]">
            {/* Desktop: the live Wix button is 239x53 (leading 1.5 = 18px padding + 17px line).
                Below 1024 it scales with the viewport: 34.09vw wide, 6.67vw tall, 2.05vw label
                (133x26 with an 8px label on a 390px phone). */}
            <ArrowButton
              variant="bronze"
              href="/book"
              className="h-[max(26px,6.67vw)] w-[34.09vw] px-0! py-0! text-[length:max(8px,2.05vw)]! lg:h-auto lg:w-auto lg:min-w-[239px] lg:px-[45px]! lg:py-[18px]! lg:text-[11.25px]! lg:leading-[1.5]!"
            >
              Discuss a project
            </ArrowButton>
          </div>
        </div>
      </Container>
    </section>
  );
}
