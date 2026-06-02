import Image from "next/image";

const services = [
  "Designing",
  "3D Modeling",
  "Renovation",
  "Construction",
  "Engineering",
];

export default function Services() {
  return (
    <section id="services" className="bg-[#0a0a0a] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="text-4xl md:text-5xl text-white mb-12"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Our Services
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-white/10">
          <div className="border-r border-white/10">
            {services.map((service, i) => (
              <div
                key={service}
                className={`px-8 py-5 text-white/80 text-sm tracking-wide hover:text-white hover:bg-white/5 transition-colors cursor-pointer ${
                  i < services.length - 1 ? "border-b border-white/10" : ""
                }`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {service}
              </div>
            ))}
            <div className="px-8 py-5">
              <button
                className="text-xs text-white/40 border border-white/20 px-4 py-2 hover:border-white/60 hover:text-white/80 transition-colors tracking-widest"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                More info
              </button>
            </div>
          </div>
          <div className="relative min-h-[340px]">
            <Image
              src="/photos/services.png"
              alt="Our services"
              fill
              className="object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
