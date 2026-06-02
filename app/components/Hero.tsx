export default function Hero() {
  return (
    <section
      id="home"
      className="min-h-screen flex flex-col items-center justify-center text-center px-6 bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-800"
    >
      <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-4 font-medium">
        Creative Designer
      </p>
      <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
        My<span className="text-indigo-400">Design</span>
      </h1>
      <p className="max-w-xl text-neutral-400 text-lg md:text-xl leading-relaxed mb-10">
        Crafting beautiful digital experiences through thoughtful design,
        clean visuals, and purposeful creativity.
      </p>
      <div className="flex gap-4 flex-wrap justify-center">
        <a
          href="#projects"
          className="px-7 py-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
        >
          View Work
        </a>
        <a
          href="#contact"
          className="px-7 py-3 rounded-full border border-neutral-600 hover:border-indigo-400 text-neutral-300 hover:text-white font-semibold transition-colors"
        >
          Get in Touch
        </a>
      </div>
    </section>
  );
}
