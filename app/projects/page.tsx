import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const projects = [
  {
    title: "Prince Mohammad Bin Salman Global Center for Arabic Calligraphy (Dar Al-Qalam)",
    description:
      "A landmark cultural institution in Riyadh designed to celebrate Arabic calligraphy as an art form. The project blends contemporary architecture with deep cultural heritage.",
    images: [
      "/photos/project1.jpg",
      "/photos/project2.jpg",
      "/photos/project3.jpg",
      "/photos/project4.jpg",
      "/photos/project1.jpg",
      "/photos/project2.jpg",
    ],
  },
  {
    title: "The Jefferson's Lake House",
    description:
      "A private lakeside residence that merges natural materials with modern design. Floor-to-ceiling glazing, warm timber, and open-plan living create a seamless indoor-outdoor experience.",
    images: [
      "/photos/project3.jpg",
      "/photos/project4.jpg",
      "/photos/project1.jpg",
      "/photos/project2.jpg",
      "/photos/project3.jpg",
      "/photos/project4.jpg",
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
            A selection of completed works spanning cultural institutions, residential design, hospitality, and commercial developments across the Kingdom.
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
                      <img
                        src={src}
                        alt={`${project.title} photo ${i + 1}`}
                        className="absolute inset-0 w-full h-full object-cover object-center hover:scale-105 transition-transform duration-500"
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
