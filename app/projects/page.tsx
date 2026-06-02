import Image from "next/image";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const projects = [
  {
    title: "Prince Mohammad Bin Salman Global Center for Arabic Calligraphy (Dar Al-Qalam)",
    description:
      "Share information on a previous project here to attract new clients. Provide a brief summary to help visitors understand the context and background of your work.",
    images: [
      "/photos/project1.png",
      "/photos/project2.png",
      "/photos/project1.png",
      "/photos/project2.png",
      "/photos/project1.png",
      "/photos/project2.png",
    ],
  },
  {
    title: "The Jefferson's Lake House",
    description:
      "Share information on a previous project here to attract new clients. Provide a brief summary to help visitors understand the context and background of your work.",
    images: [
      "/photos/project3.png",
      "/photos/project4.png",
      "/photos/project3.png",
      "/photos/project4.png",
      "/photos/project3.png",
      "/photos/project4.png",
    ],
  },
];

export default function ProjectsPage() {
  return (
    <>
      <Navbar />
      <main className="bg-[#0a0a0a] pt-24 pb-20">
        <div className="max-w-7xl mx-auto px-6">
          <h1
            className="text-5xl md:text-6xl text-white mb-4"
            style={{ fontFamily: "var(--font-playfair)" }}
          >
            Our Projects
          </h1>
          <p className="text-white/40 max-w-lg mb-16 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
            This is the space to introduce your Projects section. Take this opportunity to give visitors a brief overview of the types of projects they&apos;ll find featured in the showcase below.
          </p>

          <div className="space-y-20">
            {projects.map((project) => (
              <div key={project.title}>
                <div className="grid grid-cols-1 md:grid-cols-2 border border-white/10 mb-1">
                  <div className="px-8 py-8 border-b md:border-b-0 md:border-r border-white/10">
                    <h2
                      className="text-2xl md:text-3xl text-white leading-snug"
                      style={{ fontFamily: "var(--font-playfair)" }}
                    >
                      {project.title}
                    </h2>
                  </div>
                  <div className="px-8 py-8 flex items-center">
                    <p className="text-white/40 text-sm leading-relaxed" style={{ fontFamily: "var(--font-inter)" }}>
                      {project.description}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-1">
                  {project.images.map((src, i) => (
                    <div key={i} className="relative aspect-video overflow-hidden">
                      <Image
                        src={src}
                        alt={`${project.title} photo ${i + 1}`}
                        fill
                        className="object-cover object-top hover:scale-105 transition-transform duration-500"
                      />
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
