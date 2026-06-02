"use client";
import { useState } from "react";

type MeetingFile = { name: string; size: string };
type Meeting = {
  id: number;
  title: string;
  date: string;
  time: string;
  type: string;
  summary: string;
  decisions: string[];
  files: MeetingFile[];
  status: "Approved" | "Pending Approval";
  approvedOn?: string;
};

const projectMeetings: Record<string, { project: string; meetings: Meeting[] }> = {
  "1": {
    project: "Villa Interior — Al Nakheel",
    meetings: [
      {
        id: 1,
        title: "Project Kickoff",
        date: "Mar 1, 2026",
        time: "10:00 AM",
        type: "In-Person",
        summary: "Introduced the design team and walked through the full project scope. Client confirmed priorities: master bedroom, living area, and kitchen are the primary focus. Discussed overall style direction — contemporary with warm Saudi touches.",
        decisions: [
          "Budget confirmed at SAR 420,000",
          "Project duration: 6 months",
          "Client prefers warm beige and off-white palette",
          "Site survey scheduled for Mar 5",
        ],
        files: [{ name: "Kickoff Brief.pdf", size: "1.2 MB" }, { name: "Client Questionnaire.pdf", size: "0.8 MB" }],
        status: "Approved",
        approvedOn: "Mar 3, 2026",
      },
      {
        id: 2,
        title: "Mood Board Review",
        date: "Mar 15, 2026",
        time: "2:00 PM",
        type: "Video Call",
        summary: "Presented 3 mood board directions. Client selected Direction B — layered textures, arched doorways, and natural stone accents. Discussed fabric samples for the main sofa and requested marble options for the kitchen island.",
        decisions: [
          "Direction B approved as the design concept",
          "Marble samples to be presented by Mar 22",
          "Pendant lighting: client prefers warm brass finish",
          "Master bedroom: add a reading nook",
        ],
        files: [{ name: "Mood Board — Direction B.pdf", size: "14 MB" }, { name: "Fabric Samples Reference.jpg", size: "3.4 MB" }],
        status: "Approved",
        approvedOn: "Mar 17, 2026",
      },
      {
        id: 3,
        title: "2D Floor Plan Presentation",
        date: "Apr 2, 2026",
        time: "11:00 AM",
        type: "In-Person",
        summary: "Walked through the full 2D floor plan for all levels. Client requested minor adjustments to the kitchen layout to improve workflow and increase the pantry size. Living room flow was approved as presented.",
        decisions: [
          "Pantry to be extended by 1.2 sqm",
          "Kitchen island repositioned 30cm toward dining area",
          "Guest bathroom: change from single to double vanity",
          "Floor plan revision to be shared within 5 business days",
        ],
        files: [{ name: "Floor Plan v2.pdf", size: "4.2 MB" }],
        status: "Approved",
        approvedOn: "Apr 5, 2026",
      },
      {
        id: 4,
        title: "3D Renders Review",
        date: "Jun 1, 2026",
        time: "3:00 PM",
        type: "In-Person",
        summary: "Presented 3D renders for the living room, master bedroom, and kitchen. Client loved the living room and kitchen. Requested changes to the master bedroom — wardrobe doors to be changed from sliding to hinged, and ceiling treatment to be simplified.",
        decisions: [
          "Living room and kitchen renders approved",
          "Master bedroom: hinged wardrobe doors instead of sliding",
          "Master bedroom ceiling: remove cove lighting, keep simple cornice",
          "Revised renders to be sent within one week",
        ],
        files: [
          { name: "3D Render — Living Room.jpg", size: "12 MB" },
          { name: "3D Render — Kitchen.jpg", size: "10.5 MB" },
          { name: "3D Render — Master Bedroom.jpg", size: "11 MB" },
        ],
        status: "Pending Approval",
      },
    ],
  },
  "2": {
    project: "Jewelry Store — Riyadh Gallery",
    meetings: [
      {
        id: 1,
        title: "Brand & Concept Alignment",
        date: "Jan 10, 2026",
        time: "1:00 PM",
        type: "In-Person",
        summary: "Deep dive into the brand identity. Client shared brand guidelines and competitor references. Agreed on a monochromatic luxury approach — black, champagne gold, and creamy white. Display units to be custom-fabricated.",
        decisions: [
          "Color palette: black, champagne gold, cream white",
          "All display units to be custom-fabricated",
          "Lighting: warm spot lighting over each display, no overhead fluorescent",
          "Brand logo to be etched on the main counter fascia",
        ],
        files: [{ name: "Brand Guidelines.pdf", size: "5.1 MB" }],
        status: "Approved",
        approvedOn: "Jan 13, 2026",
      },
      {
        id: 2,
        title: "Technical Plans Review",
        date: "Jun 2, 2026",
        time: "10:30 AM",
        type: "Video Call",
        summary: "Presented final technical plans ready for contractor handover. Client reviewing all drawings and specifications. Store fitout cannot begin until client has signed off on all documentation.",
        decisions: [
          "Client to review all drawings by Jun 9",
          "Contractor mobilization to start Jun 20 upon approval",
          "Final material specifications attached for review",
        ],
        files: [{ name: "Store Layout Final.pdf", size: "6.8 MB" }, { name: "Material Specifications.pdf", size: "2.9 MB" }],
        status: "Pending Approval",
      },
    ],
  },
  "3": {
    project: "Corporate Office — NEOM",
    meetings: [
      {
        id: 1,
        title: "Initial Discovery Meeting",
        date: "May 20, 2026",
        time: "9:00 AM",
        type: "In-Person",
        summary: "First meeting to understand the scope. Client described a biophilic, open-plan office for 120 staff across 3 departments. Emphasis on collaboration zones and private focus pods. No traditional cubicles.",
        decisions: [
          "Headcount: 120 employees (Marketing 40, Tech 50, Operations 30)",
          "No cubicles — open zones with bookable meeting rooms",
          "Biophilic elements: living walls, natural materials, ample daylight",
          "Headcount breakdown document to be submitted by client",
        ],
        files: [{ name: "Discovery Notes.pdf", size: "0.9 MB" }],
        status: "Pending Approval",
      },
    ],
  },
};

const projectList = [
  { id: "1", name: "Villa Interior — Al Nakheel", pending: 1 },
  { id: "2", name: "Jewelry Store — Riyadh Gallery", pending: 1 },
  { id: "3", name: "Corporate Office — NEOM", pending: 1 },
];

function CheckIcon() {
  return (
    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-3.5 h-3.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}

export default function MeetingsPage() {
  const [selectedId, setSelectedId] = useState("1");
  const [approvedIds, setApprovedIds] = useState<number[]>([]);
  const data = projectMeetings[selectedId];

  function approve(meetingId: number) {
    setApprovedIds(prev => [...prev, meetingId]);
  }

  return (
    <div className="flex h-screen">
      {/* Project list */}
      <div className="w-64 border-r border-white/[0.06] flex flex-col flex-shrink-0">
        <div className="px-5 py-4 border-b border-white/[0.06]">
          <h1 className="text-white text-sm tracking-widest" style={{ fontFamily: "var(--font-inter)" }}>MEETINGS</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          {projectList.map(p => (
            <button key={p.id} onClick={() => setSelectedId(p.id)}
              className={`w-full text-left px-5 py-4 border-b border-white/[0.06] hover:bg-white/[0.03] transition-colors ${selectedId === p.id ? "bg-white/[0.05]" : ""}`}>
              <p className="text-white/70 text-xs leading-snug mb-1" style={{ fontFamily: "var(--font-inter)" }}>{p.name}</p>
              {p.pending > 0 && (
                <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{p.pending} pending approval</p>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Meeting timeline */}
      <div className="flex-1 overflow-y-auto p-8">
        <div className="max-w-2xl">
          <h2 className="text-2xl text-white mb-1" style={{ fontFamily: "var(--font-playfair)" }}>{data.project}</h2>
          <p className="text-white/30 text-sm mb-10" style={{ fontFamily: "var(--font-inter)" }}>Meeting log — review and approve each session&apos;s documentation.</p>

          <div className="space-y-0">
            {data.meetings.map((m, i) => {
              const isApproved = m.status === "Approved" || approvedIds.includes(m.id);
              const isPending = !isApproved;
              return (
                <div key={m.id} className="flex gap-5">
                  {/* Timeline spine */}
                  <div className="flex flex-col items-center flex-shrink-0 w-5">
                    <div className={`w-3 h-3 rounded-full mt-1 border-2 flex-shrink-0 ${isApproved ? "bg-white border-white" : "border-white/40 bg-transparent"}`} />
                    {i < data.meetings.length - 1 && <div className="w-px flex-1 mt-2 mb-0 bg-white/10" style={{ minHeight: "32px" }} />}
                  </div>

                  {/* Card */}
                  <div className={`flex-1 mb-8 border ${isPending ? "border-white/20" : "border-white/[0.08]"} bg-[#161616] p-6`}>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div>
                        <h3 className="text-white text-sm mb-1" style={{ fontFamily: "var(--font-inter)" }}>{m.title}</h3>
                        <p className="text-white/30 text-xs" style={{ fontFamily: "var(--font-inter)" }}>{m.date} · {m.time} · {m.type}</p>
                      </div>
                      {isApproved ? (
                        <span className="flex items-center gap-1.5 text-white/40 text-xs border border-white/10 px-2.5 py-1 flex-shrink-0"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          <CheckIcon /> Approved{m.approvedOn ? ` · ${m.approvedOn}` : ""}
                        </span>
                      ) : (
                        <span className="text-white/50 text-xs border border-white/30 px-2.5 py-1 flex-shrink-0 bg-white/[0.03]"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          Pending Approval
                        </span>
                      )}
                    </div>

                    {/* Summary */}
                    <p className="text-white/50 text-xs leading-relaxed mb-5" style={{ fontFamily: "var(--font-inter)" }}>{m.summary}</p>

                    {/* Decisions */}
                    <div className="mb-5">
                      <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DECISIONS & AGREEMENTS</p>
                      <ul className="space-y-2">
                        {m.decisions.map((d, j) => (
                          <li key={j} className="flex items-start gap-2.5 text-xs text-white/50" style={{ fontFamily: "var(--font-inter)" }}>
                            <span className="text-white/20 mt-0.5 flex-shrink-0">—</span>
                            {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Files */}
                    {m.files.length > 0 && (
                      <div className="mb-5">
                        <p className="text-white/20 text-xs tracking-widest mb-3" style={{ fontFamily: "var(--font-inter)" }}>DOCUMENTATION</p>
                        <div className="space-y-2">
                          {m.files.map((f, j) => (
                            <div key={j} className="flex items-center justify-between py-2 px-3 border border-white/[0.06] bg-white/[0.02]">
                              <div className="flex items-center gap-2 text-white/40 text-xs" style={{ fontFamily: "var(--font-inter)" }}>
                                <FileIcon />
                                <span>{f.name}</span>
                                <span className="text-white/20">{f.size}</span>
                              </div>
                              <button className="text-white/20 hover:text-white/60 transition-colors">
                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Approve button */}
                    {isPending && (
                      <div className="pt-2 border-t border-white/[0.06]">
                        <p className="text-white/25 text-xs mb-3" style={{ fontFamily: "var(--font-inter)" }}>
                          By approving, you confirm that the notes and decisions above accurately reflect what was discussed in this meeting.
                        </p>
                        <button onClick={() => approve(m.id)}
                          className="px-6 py-2.5 border border-white text-white text-xs tracking-widest hover:bg-white hover:text-black transition-colors"
                          style={{ fontFamily: "var(--font-inter)" }}>
                          Approve Meeting Notes
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
