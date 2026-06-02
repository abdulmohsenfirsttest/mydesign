const projects = [
  {
    title: "Brand Identity",
    category: "Branding",
    description: "Full brand system including logo, color palette, and typography for a modern startup.",
    color: "from-violet-600 to-indigo-600",
  },
  {
    title: "Mobile App UI",
    category: "UI/UX",
    description: "Clean and intuitive interface design for a fitness tracking mobile application.",
    color: "from-indigo-600 to-cyan-600",
  },
  {
    title: "Landing Page",
    category: "Web Design",
    description: "High-converting landing page design with engaging animations and clear hierarchy.",
    color: "from-cyan-600 to-teal-600",
  },
  {
    title: "Icon System",
    category: "Illustration",
    description: "Consistent 80-icon set designed for a SaaS product dashboard.",
    color: "from-teal-600 to-green-600",
  },
  {
    title: "Dashboard Design",
    category: "UI/UX",
    description: "Data-rich analytics dashboard with emphasis on readability and quick insights.",
    color: "from-orange-600 to-rose-600",
  },
  {
    title: "Print Campaign",
    category: "Print",
    description: "Multi-piece print campaign combining bold typography and striking photography.",
    color: "from-rose-600 to-pink-600",
  },
];

export default function Projects() {
  return (
    <section id="projects" className="py-24 px-6 bg-neutral-950">
      <div className="max-w-6xl mx-auto">
        <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-3 font-medium text-center">
          Portfolio
        </p>
        <h2 className="text-4xl md:text-5xl font-bold text-white text-center mb-4">
          Selected Work
        </h2>
        <p className="text-neutral-400 text-center max-w-xl mx-auto mb-16">
          A collection of projects spanning branding, UI/UX, web design, and illustration.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project.title}
              className="group rounded-2xl overflow-hidden bg-neutral-900 border border-neutral-800 hover:border-indigo-500/50 transition-all duration-300 cursor-pointer"
            >
              <div
                className={`h-48 bg-gradient-to-br ${project.color} flex items-center justify-center`}
              >
                <span className="text-white/20 text-6xl font-bold select-none">
                  {project.title[0]}
                </span>
              </div>
              <div className="p-6">
                <span className="text-xs uppercase tracking-widest text-indigo-400 font-medium">
                  {project.category}
                </span>
                <h3 className="text-lg font-semibold text-white mt-1 mb-2">
                  {project.title}
                </h3>
                <p className="text-neutral-400 text-sm leading-relaxed">
                  {project.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
