export default function Hero() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <img
        src="/photos/hero.png"
        alt="Architecture interior"
        className="absolute inset-0 w-full h-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-black/55" />
      <div className="absolute inset-0 flex items-end pb-20 px-10 md:px-16">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl text-white max-w-3xl leading-tight"
          style={{ fontFamily: "var(--font-playfair)" }}
        >
          Designed with Vision. Built with Precision.
        </h1>
      </div>
    </section>
  );
}
