const testimonials = [
  {
    quote: "Working with My Design transformed our space completely. Their attention to detail and cultural sensitivity made every decision feel right. The result exceeded our expectations.",
    name: "Mohammed Al-Rashid",
  },
  {
    quote: "The team delivered a stunning interior that perfectly balances modern aesthetics with our brand identity. Professional, creative, and highly accountable.",
    name: "Lars & Mary Williams",
  },
  {
    quote: "From concept to completion, the process was seamless. My Design brought a level of precision and passion that truly sets them apart in the industry.",
    name: "Chris Parks",
  },
];

export default function Testimonials() {
  return (
    <section className="bg-[#0a0a0a] py-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="text-4xl md:text-5xl text-white mb-14 text-center"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Testimonials
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="border border-white/15 p-8 flex flex-col justify-between"
            >
              <p
                className="text-white/60 text-sm leading-relaxed mb-8 italic"
                style={{ fontFamily: "var(--font-playfair)" }}
              >
                &ldquo;{t.quote}&rdquo;
              </p>
              <p
                className="text-white text-sm tracking-wide"
                style={{ fontFamily: "var(--font-inter)" }}
              >
                {t.name}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
