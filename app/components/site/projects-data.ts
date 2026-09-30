// Portfolio data for the public site (v5.0.0, cloned from mydesign.sa).
// Single source for both the "Featured Work" strip and the "Selected Work"
// grid. Photos are self-hosted crops of the Wix artwork: 653x408 is the
// native Wix card size at 1440px, so they are 1x only.

export type ProjectCategory =
  | "Learning & Culture"
  | "Workplace"
  | "Residential & Hospitality"
  | "Retail & Experience";

export type Project = {
  /** Project number as printed on the site, e.g. "01". */
  num: string;
  slug: string;
  title: string;
  /** The Selected Work filter this project belongs to. */
  category: ProjectCategory;
  /** Tag line under the card title, printed as-is (uppercase). */
  tags: string;
  image: { src: string; width: number; height: number; alt: string };
  /** Present only for the four projects in the Featured Work strip. */
  featured?: { label: string; city: string };
};

/** Filter order in the Selected Work bar (after "All Projects"). */
export const PROJECT_CATEGORIES: readonly ProjectCategory[] = [
  "Learning & Culture",
  "Workplace",
  "Residential & Hospitality",
  "Retail & Experience",
];

export const ALL_PROJECTS_LABEL = "All Projects";

export const PROJECTS: readonly Project[] = [
  {
    num: "01",
    slug: "mydesign-headquarters",
    title: "MY DESIGN Headquarters",
    category: "Workplace",
    tags: "WORKPLACE / INTERIOR / BUILD · RIYADH",
    image: {
      src: "/wix/projects/01-mydesign-headquarters.jpg",
      width: 653,
      height: 408,
      alt: "MY DESIGN headquarters at dusk: a pale stone facade with vertical fins, warm lighting and olive trees",
    },
    featured: { label: "WORKPLACE", city: "RIYADH" },
  },
  {
    num: "02",
    slug: "cultural-school",
    title: "Cultural School",
    category: "Learning & Culture",
    tags: "EDUCATION / CULTURE · RIYADH",
    image: {
      src: "/wix/projects/02-cultural-school.jpg",
      width: 653,
      height: 408,
      alt: "Cultural School at sunset: a cream building with colourful perforated screens and students walking to the entrance",
    },
    featured: { label: "LEARNING & CULTURE", city: "RIYADH" },
  },
  {
    num: "03",
    slug: "qurrat-day-care",
    title: "Qurrat Day Care",
    category: "Learning & Culture",
    tags: "EARLY YEARS / LEARNING · RIYADH",
    image: {
      src: "/wix/projects/03-qurrat-day-care.jpg",
      width: 653,
      height: 408,
      alt: "Qurrat Day Care entrance: a mint-green wall with an arched doorway, a parent walking a child in, beside a brochure page",
    },
  },
  {
    num: "04",
    slug: "takamol-workplace",
    title: "Takamol Workplace",
    category: "Workplace",
    tags: "WORKPLACE / TRANSFORMATION · RIYADH",
    image: {
      src: "/wix/projects/04-takamol-workplace.jpg",
      width: 653,
      height: 408,
      alt: "Takamol reception: a marble desk before a timber wall with the lit Takamol logo, open-plan offices on either side",
    },
  },
  {
    num: "05",
    slug: "abdullah-family-farm",
    title: "Abdullah Family Farm",
    category: "Residential & Hospitality",
    tags: "HOSPITALITY / LANDSCAPE · RIYADH",
    image: {
      src: "/wix/projects/05-abdullah-family-farm.jpg",
      width: 653,
      height: 408,
      alt: "Abdullah Family Farm courtyard: sail canopies on angled stone columns shading a sunken lawn between pools",
    },
    featured: { label: "RESIDENTIAL & HOSPITALITY", city: "RIYADH" },
  },
  {
    num: "06",
    slug: "abuhaimed-jewelry",
    title: "Abuhaimed Jewelry",
    category: "Retail & Experience",
    tags: "RETAIL / HERITAGE · RIYADH",
    image: {
      src: "/wix/projects/06-abuhaimed-jewelry.jpg",
      width: 653,
      height: 408,
      alt: "Abuhaimed Jewelry storefront: a deep green facade with gold-lit display windows and shoppers at the door",
    },
  },
  {
    num: "07",
    slug: "heritage-commission",
    title: "Heritage Commission",
    category: "Learning & Culture",
    tags: "LIBRARY / WORKPLACE · RIYADH",
    image: {
      src: "/wix/projects/07-heritage-commission.jpg",
      width: 653,
      height: 408,
      alt: "Heritage Commission lobby: wave-lit stone walls, a timber-clad entrance portal and a curved white reception desk",
    },
    featured: { label: "LEARNING & CULTURE", city: "RIYADH" },
  },
  {
    num: "08",
    slug: "al-madinah-residence",
    title: "Al Madinah Residence",
    category: "Residential & Hospitality",
    tags: "RESIDENTIAL / HOSPITALITY · AL MADINAH",
    image: {
      src: "/wix/projects/08-al-madinah-residence.jpg",
      width: 653,
      height: 408,
      alt: "Al Madinah Residence at dusk: a stone facade with carved timber mashrabiya windows and tall arched glazing",
    },
  },
];

/** Featured Work strip order, as on mydesign.sa: 01, 02, 07, 05. */
const FEATURED_ORDER = ["01", "02", "07", "05"] as const;

export type FeaturedProject = Project & { featured: NonNullable<Project["featured"]> };

export const FEATURED_PROJECTS: readonly FeaturedProject[] = FEATURED_ORDER.flatMap((num) => {
  const project = PROJECTS.find((p) => p.num === num);
  return project?.featured ? [{ ...project, featured: project.featured }] : [];
});

export type ProjectFilter = typeof ALL_PROJECTS_LABEL | ProjectCategory;

/** Filter bar entries with counts computed from the data above. */
export const PROJECT_FILTERS: readonly { label: ProjectFilter; count: number }[] = [
  { label: ALL_PROJECTS_LABEL, count: PROJECTS.length },
  ...PROJECT_CATEGORIES.map((category) => ({
    label: category,
    count: PROJECTS.filter((p) => p.category === category).length,
  })),
];
