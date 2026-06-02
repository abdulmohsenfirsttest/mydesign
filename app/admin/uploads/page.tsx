"use client";
import { useState } from "react";

const projects = ["Villa Interior — Al Nakheel", "Jewelry Store — Riyadh Gallery", "Corporate Office — NEOM", "Private Residence — Jeddah"];

const recentUploads = [
  { name: "Floor Plan v3.pdf", project: "Villa Interior — Al Nakheel", client: "Ahmed Al-Rashid", size: "4.2 MB", date: "Jun 1, 2026" },
  { name: "3D Render — Living Room.jpg", project: "Villa Interior — Al Nakheel", client: "Ahmed Al-Rashid", size: "12 MB", date: "May 28, 2026" },
  { name: "Store Layout Final.pdf", project: "Jewelry Store — Riyadh Gallery", client: "Nora Al-Ghamdi", size: "6.8 MB", date: "Jun 2, 2026" },
];

export default function UploadsPage() {
  const [dragging, setDragging] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [project, setProject] = useState("");

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragging(false);
    if (project) { setUploaded(true); setTimeout(() => setUploaded(false), 2500); }
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Upload Files</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Share files and deliverables directly to a client&apos;s portal.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="border border-white/[0.08] bg-[#161616] p-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>UPLOAD TO PROJECT</h2>
          <div className="mb-4">
            <label className="block text-xs text-white/30 mb-2 tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>Select Project</label>
            <select value={project} onChange={e => setProject(e.target.value)}
              className="w-full bg-[#1e1e1e] border border-white/15 text-white/60 text-xs px-3 py-3 focus:outline-none focus:border-white/40"
              style={{ fontFamily: "var(--font-inter)" }}>
              <option value="">Choose project...</option>
              {projects.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>

          <div onDragOver={e => { e.preventDefault(); setDragging(true); }}
            onDragLeave={() => setDragging(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-sm p-10 text-center transition-colors cursor-pointer ${dragging ? "border-white/40 bg-white/[0.03]" : "border-white/10 hover:border-white/25"}`}>
            {uploaded ? (
              <p className="text-white/60 text-sm" style={{ fontFamily: "var(--font-inter)" }}>✓ File uploaded to client portal</p>
            ) : (
              <>
                <svg className="w-8 h-8 text-white/20 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/>
                </svg>
                <p className="text-white/30 text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>Drag & drop files here</p>
                <p className="text-white/15 text-xs" style={{ fontFamily: "var(--font-inter)" }}>PDF, JPG, PNG, DWG — up to 50MB</p>
                <label className="mt-4 inline-block px-4 py-2 border border-white/15 text-white/30 text-xs hover:border-white/30 hover:text-white/50 transition-colors cursor-pointer"
                  style={{ fontFamily: "var(--font-inter)" }}>
                  Browse files
                  <input type="file" className="hidden" multiple onChange={() => { if (project) { setUploaded(true); setTimeout(() => setUploaded(false), 2500); } }} />
                </label>
              </>
            )}
          </div>
        </div>

        <div className="border border-white/[0.08] bg-[#161616] p-6">
          <h2 className="text-white text-sm tracking-widest mb-5" style={{ fontFamily: "var(--font-inter)" }}>RECENTLY UPLOADED</h2>
          <div className="space-y-3">
            {recentUploads.map((f, i) => (
              <div key={i} className="flex items-start justify-between py-3 border-b border-white/[0.06] last:border-0">
                <div>
                  <p className="text-white/60 text-xs mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{f.name}</p>
                  <p className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{f.project} · {f.size} · {f.date}</p>
                </div>
                <span className="text-white/20 text-xs" style={{ fontFamily: "var(--font-inter)" }}>Visible to {f.client.split(" ")[0]}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
