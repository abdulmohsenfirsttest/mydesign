import Image from "next/image";

export default function Hero() {
  return (
    <section id="home" className="relative h-screen w-full overflow-hidden">
      <Image
        src="https://picsum.photos/seed/arch1/1600/900"
        alt="Architecture interior"
        fill
        className="object-cover"
        priority
      />
      <div className="absolute inset-0 bg-black/50" />
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
