import Image from "next/image";

export default function About() {
  return (
    <section id="about" className="bg-[#0a0a0a]">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2">
        <div className="relative h-80 lg:h-auto min-h-[420px]">
          <Image
            src="https://picsum.photos/seed/construct1/800/600"
            alt="Our team at work"
            fill
            className="object-cover"
          />
        </div>
        <div className="px-10 py-16 lg:px-16 lg:py-20 flex flex-col justify-center">
          <h2
            className="text-4xl md:text-5xl text-white mb-6"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            About Us
          </h2>
          <p className="text-white/60 leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>
            My Design is a Riyadh-based design and construction firm founded in 2016. We create modern, culturally inspired spaces that blend creativity with craftsmanship. Our expertise spans architecture, interiors, and jewelry design — turning ideas into timeless expressions of beauty and function.
          </p>
          <p className="text-white/60 leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
            Driven by a passionate Saudi team, we proudly align our vision with Saudi Vision 2030, embracing innovation, quality, and the future of design and construction in the Kingdom.
          </p>
        </div>
      </div>
    </section>
  );
}
