// Closing call to action — rebuilt from the Wix section artwork (a flat PNG on
// mydesign.sa: 1440px desktop art + 390px phone art). One line at 1440; on
// phones the heading wraps to "Start with a / conversation." as in the phone art.
// A full-width 1px hairline closes the section (y=493 in the art), above Trust.
import { ArrowButton, Container, Eyebrow } from "./primitives";

export default function Closing() {
  return (
    <section
      id="contact"
      aria-labelledby="contact-heading"
      className="border-b border-site-line bg-site-ink pt-20 pb-24 text-center text-site-cream md:pt-28 md:pb-28 xl:pt-[121px] xl:pb-[131px]"
    >
      <Container>
        <Eyebrow className="text-site-cream/80">LET’S BUILD WHAT’S NEXT.</Eyebrow>
        <h2
          id="contact-heading"
          className="mt-[14px] font-display text-[length:clamp(40px,8.2vw,118px)] leading-[1.1] font-normal tracking-[-0.025em] md:mt-[10px] md:leading-none"
        >
          Start with a conversation.
        </h2>
        <div className="mt-8 flex justify-center md:mt-[52px]">
          <ArrowButton variant="cream" href="/book">
            Discuss a project
          </ArrowButton>
        </div>
      </Container>
    </section>
  );
}
