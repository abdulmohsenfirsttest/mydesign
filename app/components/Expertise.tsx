import Image from "next/image";

const categories = [
  { label: "Education",    photo: "/photos/expertise1.png" },
  { label: "Hospitality",  photo: "/photos/expertise1.png" },
  { label: "Art & Culture",photo: "/photos/expertise2.png" },
  { label: "Real Estate",  photo: "/photos/expertise2.png" },
  { label: "Commercial",   photo: "/photos/expertise3.png" },
  { label: "Offices",      photo: "/photos/expertise3.png" },
];

export default function Expertise() {
  return (
    <section className="bg-[#0a0a0a] py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2
          className="text-4xl md:text-5xl text-white mb-12 text-center"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Our Expertise
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
          {categories.map((cat, i) => (
            <div key={cat.label} className="relative aspect-square group overflow-hidden">
              <Image
                src={cat.photo}
                alt={cat.label}
                fill
                className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-black/45 group-hover:bg-black/25 transition-colors" />
              <div className="absolute bottom-0 left-0 p-4">
                <span className="block text-white/40 text-xs mb-1" style={{ fontFamily: "var(--font-inter)" }}>
                  0{i + 1}
                </span>
                <span className="block text-white text-sm tracking-wide" style={{ fontFamily: "var(--font-inter)" }}>
                  {cat.label}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end mt-6">
          <button
            className="text-xs text-white/40 border border-white/20 px-5 py-2 hover:border-white/60 hover:text-white/80 transition-colors tracking-widest"
            style={{ fontFamily: "var(--font-inter)" }}
          >
            View All
          </button>
        </div>
      </div>
    </section>
  );
}
