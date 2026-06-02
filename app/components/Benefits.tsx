const benefits = [
  "Vast\nExperience",
  "Professional\nTeam",
  "High\nFinish",
  "Sustainable &\nAccountable",
];

export default function Benefits() {
  return (
    <section className="bg-[#0a0a0a] border-t border-b border-white/10">
      <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4">
        {benefits.map((benefit, i) => (
          <div
            key={i}
            className={`px-8 py-10 text-center text-white/80 text-sm tracking-wide border-white/10 ${
              i < benefits.length - 1 ? "border-r" : ""
            }`}
            style={{ fontFamily: "var(--font-inter)" }}
          >
            {benefit.split("\n").map((line, j) => (
              <span key={j} className="block">{line}</span>
            ))}
          </div>
        ))}
      </div>
    </section>
  );
}
