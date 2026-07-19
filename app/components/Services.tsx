// Canonical Meeting-3 catalog — kept in step with the /book service list.
const services = [
  "Interior Design",
  "Exterior Design",
  "Landscape Design",
  "Interior & Exterior",
  "Full Package",
  "Renovation Planning & Construction Management",
];

export default function Services() {
  return (
    <section id="services" className="bg-background py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="text-4xl md:text-5xl text-foreground mb-12"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Our Services
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 border border-soft">
          <div className="border-r border-soft">
            {services.map((service, i) => (
              <div
                key={service}
                className={`px-8 py-5 text-muted-1 text-sm tracking-wide hover:text-foreground hover:bg-fill transition-colors cursor-pointer ${
                  i < services.length - 1 ? "border-b border-soft" : ""
                }`}
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {service}
              </div>
            ))}
            <div className="px-8 py-5">
              <button
                className="text-xs text-muted-2 border border-border px-4 py-2 hover:border-strong hover:text-muted-1 transition-colors tracking-widest"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                More info
              </button>
            </div>
          </div>
          <div className="relative min-h-[340px]">
            <img
              src="/photos/services.jpg"
              alt="Our services"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
