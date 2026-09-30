import type { Metadata } from "next";
import SiteHeader from "../components/site/SiteHeader";
import SiteFooter from "../components/site/SiteFooter";
import SelectedWork from "../components/site/SelectedWork";

export const metadata: Metadata = {
  title: "Projects — MY DESIGN",
};

export default function ProjectsPage() {
  return (
    <>
      <SiteHeader />
      {/* pt clears the fixed header; SelectedWork owns the page's <h1> here. */}
      <main data-public-site className="bg-site-ink pt-[110px]">
        <SelectedWork standalone />
      </main>
      <SiteFooter />
    </>
  );
}
