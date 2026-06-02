"use client";
import { useState } from "react";

const reviews = [
  {
    id: 1, title: "Living Room — Concept A", project: "Villa Interior — Al Nakheel", date: "Jun 1, 2026",
    description: "Initial concept direction for the main living area. Features a neutral palette with warm wood accents and bespoke furniture pieces.",
    status: "Awaiting Review", img: "/photos/project3.jpg",
  },
  {
    id: 2, title: "Living Room — Concept B", project: "Villa Interior — Al Nakheel", date: "Jun 1, 2026",
    description: "Alternative concept with darker tones and a more contemporary feel. Includes statement lighting fixtures.",
    status: "Awaiting Review", img: "/photos/project4.jpg",
  },
  {
    id: 3, title: "Store Display Unit — Final", project: "Jewelry Store — Riyadh Gallery", date: "May 30, 2026",
    description: "Finalized display unit design with custom brass detailing and back-lit showcases. Ready for fabrication upon approval.",
    status: "Approved", img: "/photos/exp-hospitality.jpg",
  },
  {
    id: 4, title: "Lighting Mood — Option 1", project: "Villa Interior — Al Nakheel", date: "May 20, 2026",
    description: "Warm ambient lighting scheme using recessed LEDs and floor lamps.",
    status: "Changes Requested", img: "/photos/exp-education.jpg",
  },
];

const statusColors: Record<string, string> = {
  "Awaiting Review": "border-white/40 text-white/60",
  "Approved": "border-white/20 text-white/40",
  "Changes Requested": "border-white/30 text-white/50",
};

export default function ReviewsPage() {
  const [statuses, setStatuses] = useState<Record<number, string>>(
    Object.fromEntries(reviews.map(r => [r.id, r.status]))
  );
  const [comment, setComment] = useState<Record<number, string>>({});

  function approve(id: number) { setStatuses(s => ({ ...s, [id]: "Approved" })); }
  function request(id: number) { setStatuses(s => ({ ...s, [id]: "Changes Requested" })); }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>Design Reviews</h1>
        <p className="text-white/40 text-sm" style={{ fontFamily: "var(--font-inter)" }}>Review and approve design concepts from your team.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {reviews.map(r => {
          const st = statuses[r.id];
          return (
            <div key={r.id} className="border border-white/[0.08] bg-[#161616] overflow-hidden">
              <div className="relative h-48 overflow-hidden">
                <img src={r.img} alt={r.title} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/30" />
                <span className={`absolute top-3 right-3 text-xs px-2.5 py-1 border bg-[#161616] ${statusColors[st] ?? "border-white/10 text-white/30"}`}
                  style={{ fontFamily: "var(--font-inter)" }}>{st}</span>
              </div>
              <div className="p-5">
                <p className="text-white text-sm mb-0.5" style={{ fontFamily: "var(--font-inter)" }}>{r.title}</p>
                <p className="text-white/30 text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>{r.project} · {r.date}</p>
                <p className="text-white/40 text-xs leading-relaxed mb-4" style={{ fontFamily: "var(--font-inter)" }}>{r.description}</p>

                <textarea
                  value={comment[r.id] ?? ""}
                  onChange={e => setComment(c => ({ ...c, [r.id]: e.target.value }))}
                  placeholder="Add a comment or feedback..."
                  rows={2}
                  className="w-full bg-transparent border border-white/10 text-white text-xs px-3 py-2.5 focus:outline-none focus:border-white/30 transition-colors placeholder-white/20 resize-none mb-3"
                  style={{ fontFamily: "var(--font-inter)" }} />

                {st === "Awaiting Review" && (
                  <div className="flex gap-2">
                    <button onClick={() => approve(r.id)}
                      className="flex-1 py-2 border border-white text-white text-xs hover:bg-white hover:text-black transition-colors"
                      style={{ fontFamily: "var(--font-inter)" }}>Approve</button>
                    <button onClick={() => request(r.id)}
                      className="flex-1 py-2 border border-white/20 text-white/40 text-xs hover:border-white/40 hover:text-white/60 transition-colors"
                      style={{ fontFamily: "var(--font-inter)" }}>Request Changes</button>
                  </div>
                )}
                {st !== "Awaiting Review" && (
                  <p className={`text-xs flex items-center gap-2 ${st === "Approved" ? "text-white/40" : "text-white/30"}`} style={{ fontFamily: "var(--font-inter)" }}>
                    {st === "Approved" ? "✓ Approved" : "↩ Changes requested — team notified"}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
