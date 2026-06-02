const skills = [
  "Brand Identity", "UI/UX Design", "Web Design",
  "Typography", "Motion Design", "Illustration",
  "Figma", "Adobe Suite", "Design Systems",
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 bg-neutral-900">
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-sm uppercase tracking-[0.3em] text-indigo-400 mb-3 font-medium">
            About
          </p>
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            Turning ideas into{" "}
            <span className="text-indigo-400">visual stories</span>
          </h2>
          <p className="text-neutral-400 leading-relaxed mb-5">
            I&apos;m a passionate designer with a focus on creating meaningful and
            memorable visual experiences. I believe great design is where art
            meets purpose — every pixel should serve the story.
          </p>
          <p className="text-neutral-400 leading-relaxed mb-8">
            With experience across branding, digital products, and print, I
            bring a versatile approach to each project, always starting from a
            deep understanding of the audience and the goal.
          </p>
          <a
            href="#contact"
            className="inline-block px-7 py-3 rounded-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold transition-colors"
          >
            Work Together
          </a>
        </div>
        <div>
          <h3 className="text-sm uppercase tracking-widest text-neutral-500 mb-5 font-medium">
            Skills &amp; Tools
          </h3>
          <div className="flex flex-wrap gap-3">
            {skills.map((skill) => (
              <span
                key={skill}
                className="px-4 py-2 rounded-full text-sm bg-neutral-800 text-neutral-300 border border-neutral-700 hover:border-indigo-500/60 hover:text-indigo-300 transition-colors"
              >
                {skill}
              </span>
            ))}
          </div>
          <div className="mt-10 grid grid-cols-3 gap-6 text-center">
            {[
              { value: "5+", label: "Years Experience" },
              { value: "80+", label: "Projects Done" },
              { value: "30+", label: "Happy Clients" },
            ].map((stat) => (
              <div key={stat.label} className="bg-neutral-800 rounded-2xl p-5 border border-neutral-700">
                <div className="text-3xl font-bold text-indigo-400">{stat.value}</div>
                <div className="text-xs text-neutral-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
