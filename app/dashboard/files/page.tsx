const files = [
  { name: "Floor Plan v3.pdf", project: "Villa Interior — Al Nakheel", size: "4.2 MB", date: "Jun 1, 2026", type: "pdf" },
  { name: "3D Render — Living Room.jpg", project: "Villa Interior — Al Nakheel", size: "12 MB", date: "May 28, 2026", type: "img" },
  { name: "3D Render — Master Bedroom.jpg", project: "Villa Interior — Al Nakheel", size: "9.8 MB", date: "May 28, 2026", type: "img" },
  { name: "Material Palette.pdf", project: "Villa Interior — Al Nakheel", size: "8.1 MB", date: "May 20, 2026", type: "pdf" },
  { name: "Store Layout Final.pdf", project: "Jewelry Store — Riyadh Gallery", size: "6.8 MB", date: "Jun 2, 2026", type: "pdf" },
  { name: "Lighting Scheme.pdf", project: "Jewelry Store — Riyadh Gallery", size: "3.4 MB", date: "May 30, 2026", type: "pdf" },
  { name: "Display Unit Drawings.dwg", project: "Jewelry Store — Riyadh Gallery", size: "2.1 MB", date: "May 25, 2026", type: "dwg" },
  { name: "Brand Guidelines.pdf", project: "Jewelry Store — Riyadh Gallery", size: "15 MB", date: "Jan 10, 2026", type: "pdf" },
];

import { ReactElement } from "react";

const iconMap: Record<string, ReactElement> = {
  pdf: <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/></svg>,
  img: <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/></svg>,
  dwg: <svg className="w-5 h-5 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"/></svg>,
};

export default function FilesPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Files & Deliverables</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>All documents and assets shared by the design team.</p>
      </div>

      <div className="border border-white/[0.08] bg-[#161616]">
        <div className="grid grid-cols-12 px-5 py-3 border-b border-white/[0.06] text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
          <span className="col-span-5">Name</span>
          <span className="col-span-3">Project</span>
          <span className="col-span-2">Size</span>
          <span className="col-span-1">Date</span>
          <span className="col-span-1" />
        </div>
        {files.map((f, i) => (
          <div key={i} className={`grid grid-cols-12 items-center px-5 py-4 ${i < files.length - 1 ? "border-b border-white/[0.06]" : ""} hover:bg-white/[0.02] transition-colors`}>
            <div className="col-span-5 flex items-center gap-3">
              {iconMap[f.type]}
              <span className="text-white/70 text-sm" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</span>
            </div>
            <span className="col-span-3 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.project}</span>
            <span className="col-span-2 text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.size}</span>
            <span className="col-span-1 text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.date}</span>
            <div className="col-span-1 flex justify-end">
              <button className="text-white/20 hover:text-white/60 transition-colors">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/></svg>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
