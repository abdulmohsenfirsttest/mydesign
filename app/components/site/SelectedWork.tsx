"use client";

// "Selected Work" (id="selected-work"), rebuilt from the Wix artwork (a flat
// 1440x2728 PNG on mydesign.sa, plus a 390px phone version). Measurements
// are read off that art at 1440px and apply from xl up:
// - header and filter bar span x 68→1372 (4px wider than the page container)
// - the photo grid spans x 58→1382: two 653px columns with an 18px gutter,
//   541px from one card row to the next (58px from a hairline to the next photo)
// Phones follow the phone art: full-bleed photos, each with a dark caption bar
// (number + title), stacked with no gaps.
//
// There are no project detail pages. "VIEW PROJECT" (and the photo, through
// the button's stretched ::after hit area) opens an accessible lightbox built
// on a native modal <dialog>.
import Image from "next/image";
import { useEffect, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import { Container, Eyebrow } from "./primitives";
import { ALL_PROJECTS_LABEL, PROJECTS, PROJECT_FILTERS, type Project, type ProjectFilter } from "./projects-data";

const PANEL_ID = "selected-work-panel";
const HEADING_ID = "selected-work-heading";
const DIALOG_TITLE_ID = "selected-work-dialog-title";
const tabId = (index: number) => `selected-work-tab-${index}`;

const focusRing = "focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-site-cream";

export default function SelectedWork({
  standalone = false,
}: {
  /** On /projects: the heading becomes the page's <h1> and the section drops
      most of its top padding (the page already offsets the fixed header). */
  standalone?: boolean;
}) {
  const [filter, setFilter] = useState<ProjectFilter>(ALL_PROJECTS_LABEL);
  // Cards fade in only after the visitor changes the filter, never on first paint.
  const [hasFiltered, setHasFiltered] = useState(false);
  const [active, setActive] = useState<Project | null>(null);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<HTMLElement | null>(null);

  const visible = filter === ALL_PROJECTS_LABEL ? PROJECTS : PROJECTS.filter((p) => p.category === filter);
  const activeIndex = PROJECT_FILTERS.findIndex((f) => f.label === filter);
  const Heading = standalone ? "h1" : "h2";

  const chooseFilter = (label: ProjectFilter) => {
    setFilter(label);
    setHasFiltered(true);
  };

  // Tabs: roving tabindex, arrows/Home/End move and select (automatic activation).
  const onTabKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const last = PROJECT_FILTERS.length - 1;
    const targets: Record<string, number> = {
      ArrowRight: index === last ? 0 : index + 1,
      ArrowLeft: index === 0 ? last : index - 1,
      Home: 0,
      End: last,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    chooseFilter(PROJECT_FILTERS[next].label);
    tabRefs.current[next]?.focus();
  };

  const openProject = (project: Project, event: MouseEvent<HTMLButtonElement>) => {
    openerRef.current = event.currentTarget;
    setActive(project);
  };

  // Lightbox: open as a modal (top layer, background inert), focus the close
  // button, lock page scroll; on close, unlock and return focus to the opener.
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!active || !dialog) return;
    const opener = openerRef.current;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prevOverflow;
      if (dialog.open) dialog.close();
      opener?.focus();
    };
  }, [active]);

  return (
    <section
      id="selected-work"
      aria-labelledby={HEADING_ID}
      className={`bg-site-ink pb-20 text-site-cream md:pb-28 xl:pb-[130px] ${
        standalone ? "pt-6 xl:pt-10" : "pt-20 md:pt-28 xl:pt-[131px]"
      }`}
    >
      <Container>
        <div className="xl:-mx-1">
          {/* Header: title left, intro right (the right column starts at x=893 at 1440). */}
          <div className="lg:grid lg:grid-cols-[minmax(0,825fr)_minmax(0,479fr)] lg:items-start">
            <div>
              <Eyebrow className="text-site-cream/80">SELECTED WORK</Eyebrow>
              <Heading
                id={HEADING_ID}
                className="mt-[17px] font-display text-[length:clamp(48px,6.111vw,88px)] leading-[0.873] font-normal tracking-[-0.025em]"
              >
                Explore by
                <br />
                project type.
              </Heading>
            </div>
            {/* max-w keeps the three-line wrap of the art at 19px. */}
            <p className="mt-8 max-w-[440px] font-display text-[length:clamp(17px,1.32vw,19px)] leading-[1.5] text-site-cream/80 lg:mt-[86px]">
              The expanded portfolio is organised around how clients experience our work — making it easier to find
              the most relevant proof.
            </p>
          </div>

          {/* Filter bar: five equal tabs between two hairlines. Below xl the tabs (5 × 205px) do not
              fit, so the bar scrolls sideways (scrollbar hidden): its right edge fades out as a cue
              that more tabs follow, and a 48px spacer lets the last tab scroll clear of the fade. */}
          <div className="mt-12 overflow-x-auto border-y border-site-line [scrollbar-width:none] max-md:-mx-6 max-xl:[mask-image:linear-gradient(to_right,#000_calc(100%_-_48px),transparent)] lg:mt-[72px] [&::-webkit-scrollbar]:hidden">
            <div
              role="tablist"
              aria-label="Filter projects by type"
              className="flex h-[52px] max-xl:w-max max-xl:min-w-full max-xl:pr-12"
            >
              {PROJECT_FILTERS.map((item, index) => {
                const selected = item.label === filter;
                return (
                  <button
                    key={item.label}
                    ref={(el) => {
                      tabRefs.current[index] = el;
                    }}
                    type="button"
                    role="tab"
                    id={tabId(index)}
                    aria-selected={selected}
                    aria-controls={PANEL_ID}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => chooseFilter(item.label)}
                    onKeyDown={(event) => onTabKeyDown(event, index)}
                    className={`flex min-w-[205px] flex-1 items-center justify-between gap-3 pr-[21px] pl-5 text-left font-body leading-none transition-colors duration-200 ${focusRing} ${
                      index > 0 ? "border-l border-site-line" : ""
                    } ${selected ? "bg-site-olive text-site-cream" : "text-site-cream/80 hover:text-site-cream"}`}
                  >
                    <span className="text-[11px] tracking-[0.02em] whitespace-nowrap">{item.label}</span>
                    {/* The count sits ~3px above the label's cap line on the art. */}
                    <span className={`-mt-[6px] text-[10px] ${selected ? "" : "text-site-cream/70"}`}>
                      {item.count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div
          role="tabpanel"
          id={PANEL_ID}
          aria-labelledby={tabId(activeIndex)}
          className="mt-10 grid grid-cols-1 max-md:-mx-6 md:grid-cols-2 md:gap-x-[18px] md:gap-y-[58px] lg:mt-[54px] xl:-mx-[14px]"
        >
          {visible.map((project) => (
            // Keyed by filter too, so every card re-mounts (and fades in) when the filter changes.
            <ProjectCard
              key={`${filter}:${project.slug}`}
              project={project}
              titleAs={standalone ? "h2" : "h3"}
              fadeIn={hasFiltered}
              onOpen={openProject}
            />
          ))}
        </div>
      </Container>

      <dialog
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={DIALOG_TITLE_ID}
        onClose={() => setActive(null)}
        // A click that lands on the dialog itself (not its content) is the overlay.
        onClick={(event) => {
          if (event.target === event.currentTarget) event.currentTarget.close();
        }}
        className="fixed inset-0 m-0 h-full max-h-none w-full max-w-none justify-center overflow-y-auto border-0 bg-site-ink/95 p-4 pt-16 text-site-cream backdrop:bg-transparent open:flex md:p-16"
      >
        <button
          ref={closeRef}
          type="button"
          aria-label="Close"
          onClick={() => dialogRef.current?.close()}
          className={`absolute top-3 right-3 flex h-11 w-11 items-center justify-center text-site-cream/80 transition-colors hover:text-site-cream md:top-6 md:right-6 ${focusRing}`}
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1">
            <path d="M3 3l14 14M17 3 3 17" />
          </svg>
        </button>

        {active && (
          <figure className="my-auto w-[min(100%,960px,calc((100dvh_-_200px)*1.6))] min-w-[min(100%,280px)]">
            <div className="relative aspect-[653/408] w-full overflow-hidden bg-site-panel">
              <Image
                src={active.image.src}
                alt={active.image.alt}
                fill
                sizes="(min-width: 1100px) 960px, 92vw"
                className="object-cover"
              />
            </div>
            <figcaption className="mt-[14px] flex items-start border-b border-site-line pb-[18px]">
              <span aria-hidden="true" className="mt-[2px] w-[51px] shrink-0 font-display text-[18px] leading-none">
                {active.num}
              </span>
              <div className="min-w-0">
                <h2 id={DIALOG_TITLE_ID} className="font-display text-[length:clamp(22px,2vw,28px)] leading-none font-normal">
                  {active.title}
                </h2>
                <p className="mt-[10px] font-body text-[8px] leading-[1.4] tracking-[0.2em] text-site-cream/70 uppercase">
                  {active.tags}
                </p>
              </div>
            </figcaption>
          </figure>
        )}
      </dialog>
    </section>
  );
}

function ProjectCard({
  project,
  titleAs: Title,
  fadeIn,
  onOpen,
}: {
  project: Project;
  /** One level below the section heading: h3 under the home page's h2, h2 under /projects' h1. */
  titleAs: "h2" | "h3";
  fadeIn: boolean;
  onOpen: (project: Project, event: MouseEvent<HTMLButtonElement>) => void;
}) {
  return (
    <article
      className={`group relative ${
        fadeIn ? "motion-safe:transition-opacity motion-safe:duration-500 motion-safe:starting:opacity-0" : ""
      }`}
    >
      <div className="relative aspect-[390/205] overflow-hidden md:aspect-[653/408]">
        <Image
          src={project.image.src}
          alt={project.image.alt}
          fill
          sizes="(min-width: 1440px) 653px, (min-width: 768px) 50vw, 100vw"
          className="object-cover motion-safe:transition-transform motion-safe:duration-[1200ms] motion-safe:ease-out motion-safe:group-hover:scale-[1.04]"
        />
      </div>

      {/* Phones: a 42px dark caption bar. md+: the art's caption row over a hairline. */}
      <div className="flex h-[42px] items-center bg-site-ink-deep px-3 md:h-auto md:items-start md:border-b md:border-site-line md:bg-transparent md:px-0 md:pt-[14px] md:pb-[19px]">
        <span
          aria-hidden="true"
          className="w-[35px] shrink-0 font-body text-[9px] leading-none text-site-cream/70 md:mt-[2px] md:w-[51px] md:font-display md:text-[18px] md:text-site-cream"
        >
          {project.num}
        </span>
        <div className="min-w-0 flex-1">
          <Title className="font-display text-[19px] leading-none font-normal md:text-[length:clamp(20px,1.667vw,24px)]">
            {project.title}
          </Title>
          <p className="mt-[10px] hidden font-body text-[7.5px] leading-none tracking-[0.2em] text-site-cream/70 uppercase md:block">
            {project.tags}
          </p>
        </div>
        {/* The ::after stretches over the whole card, so the photo and title open the lightbox too. */}
        <button
          type="button"
          aria-haspopup="dialog"
          aria-label={`View project: ${project.title}`}
          onClick={(event) => onOpen(project, event)}
          className="shrink-0 font-body text-[8px] leading-none tracking-[0.2em] text-site-cream/85 uppercase transition-colors duration-200 group-hover:text-site-cream after:absolute after:inset-0 focus-visible:outline-none focus-visible:after:outline-2 focus-visible:after:-outline-offset-2 focus-visible:after:outline-site-cream md:mt-[19px] md:ml-4"
        >
          <span className="hidden md:inline">VIEW PROJECT</span>
        </button>
      </div>
    </article>
  );
}
